import Keywords from "../models/keywordsModel";
import Submissions from "../models/submissionsModel";
import User from "../models/userModel";
import Votes from "../models/votesModel";
import { analyzeSubmissionText } from "../services/aiSubmissionAnalyzer";
import { analyzeSubmissionTextWithGroq } from "../services/groqAiSubmissionAnalyzer";


export async function createSubmission(body){

    let aiResult = {
        predicted_type_of_scam: [],
        found_keywords: [],
        ai_explaination: null
    };

    try {
        aiResult = await analyzeSubmissionTextWithGroq(body.text);
    } catch (error) {
        console.error("AI submission analysis failed:", error);
    }

    const {data, error} = await Submissions.create({
        ...body,
        predicted_type_of_scam: aiResult.predicted_type_of_scam,
        found_keywords: aiResult.found_keywords,
        ai_explaination: aiResult.ai_explaination,
        total_votes:0,
        yes_votes: 0
    });

    const {data:user, error:userError} = await User.getById(body.creator)

    if (userError) {
        return {error: userError}
    }

    const {data:updatedUser, error:updateUserError} = await User.update(body.creator, {total_submission: user.total_submission + 1})

    return {data, error}

}

export async function getSubmissions(){

    return await Submissions.getAll();

}

export async function getSubmission(id){

    return await Submissions.getById(id);

}

export async function updateSubmission(id,body){

    return await Submissions.update(id,body);

}

export async function updateSubmissionByCreator(id,userId,body){

    return await Submissions.updatebyCreator(id,userId,body);

}

export async function deleteSubmission(id){

    return await Submissions.delete(id);

}

export async function deleteSubmissionByCreator(id,userId){

    return await Submissions.deleteByCreator(id, userId);

}

function getWinningCategory(votes) {
    const frequencyMap = {};
    let mostCommon = null;
    let maxCount = 0;

    for (const vote of votes) {
        if (!vote.type_of_scam) {
            continue;
        }

        frequencyMap[vote.type_of_scam] = (frequencyMap[vote.type_of_scam] || 0) + 1;

        if (frequencyMap[vote.type_of_scam] > maxCount) {
            maxCount = frequencyMap[vote.type_of_scam];
            mostCommon = vote.type_of_scam;
        }
    }

    return mostCommon;
}

function getWinningCategories(votes) {
    const frequencyMap = {};

    for (const vote of votes) {
        if (!vote.type_of_scam) {
            continue;
        }

        frequencyMap[vote.type_of_scam] =
            (frequencyMap[vote.type_of_scam] || 0) + 1;
    }

    const maxCount = Math.max(...Object.values(frequencyMap), 0);

    return Object.keys(frequencyMap).filter(
        category => frequencyMap[category] === maxCount
    );
}

async function rewardWinningVoters(winners) {
    for (const winner of winners) {
        const { data: user, error } = await User.getById(winner.voter);

        if (error) {
            return { error };
        }

        const { error: updateError } = await User.update(winner.voter, {
            score: user.score + 1
        });

        if (updateError) {
            return { error: updateError };
        }
    }

    return {};
}

async function createKeywordsFromSubmission(submission, typeOfScam) {
    if (!typeOfScam || !submission.text) {
        return {};
    }

    const words = submission.text.toLowerCase().match(/\w+/g) || [];
    const uniqueWords = [...new Set(words)];

    for (const word of uniqueWords) {

        const {data: keyword} = await Keywords.getByWordAndType(word, typeOfScam)

        if (!keyword) {
            const { error } = await Keywords.create({
                type_of_scam: typeOfScam,
                keyword: word
            });

            if (error) {
                return { error };
            }
        } 
    }

    return {};
}

export async function endSubmissionVoting(id, userId) {
    if (!userId) {
        return {
            error: { message: "Missing user id" },
            status: 401
        };
    }

    const { data: submission, error: getSubmissionError } = await Submissions.getById(id);

    if (getSubmissionError) {
        return {
            error: getSubmissionError,
            status: 404
        };
    }

    if (!submission || submission.creator != userId) {
        return {
            error: { message: "Unauthorized" },
            status: 401
        };
    }

    if (submission.is_votable === false) {
        return {
            error: { message: "Voting has already ended" },
            status: 409
        };
    }

    const { data: votes, error: getVotesError } = await Votes.getBySubmissionId(id);

    if (getVotesError) {
        return {
            error: getVotesError,
            status: 400
        };
    }

    const submissionVotes = votes || [];
    const yesCount = submissionVotes.filter((vote) => vote.vote === "Yes").length;
    const noCount = submissionVotes.filter((vote) => vote.vote === "No").length;
    const majority = yesCount >= noCount ? "Yes" : "No";
    const winners = majority ? submissionVotes.filter((vote) => vote.vote === majority) : [];
    const finalisedCategory = majority === "Yes" ? getWinningCategory(winners) : null;
    const finalisedCategories = majority === "Yes" ? getWinningCategories(winners) : null;
    const trueWinners = majority ? winners.filter((vote) =>  finalisedCategories.includes(vote.type_of_scam)) : [];
    const { error: rewardError } = await rewardWinningVoters(trueWinners);

    if (rewardError) {
        return {
            error: rewardError,
            status: 400
        };
    }

    const { error: createKeywordsError } = await createKeywordsFromSubmission(submission, finalisedCategory);

    if (createKeywordsError) {
        return {
            error: createKeywordsError,
            status: 400
        };
    }

    const { error: updateSubmissionError } = await Submissions.update(id, {
        is_votable: false,
        finalised_category: finalisedCategory,
        finalised_categories: finalisedCategories
    });

    if (updateSubmissionError) {
        return {
            error: updateSubmissionError,
            status: 400
        };
    }

    // const { error: deleteVotesError } = await Votes.deleteBySubmssionId(id);

    // if (deleteVotesError) {
    //     return {
    //         error: deleteVotesError,
    //         status: 400
    //     };
    // }

    return {
        data: {
            success: true,
            majority,
            finalised_category: finalisedCategory,
            yes_votes: yesCount,
            no_votes: noCount,
            total_votes: submissionVotes.length
        }
    };
}


export async function getSubmissionsByCurrentUser(userId){

    return await Submissions.getByCreator(userId);

}
