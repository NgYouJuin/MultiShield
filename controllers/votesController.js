import Votes from "../models/votesModel";
import Submissions from "../models/submissionsModel";
import User from "../models/userModel";


export async function createVote(body){

    return await Votes.create(body);

}

export async function getVotes(){

    return await Votes.getAll();

}

export async function getVotesbySubmissionId(submissionId){

    return await Votes.getBySubmissionId(submissionId);

}

export async function getSubmissionVotes(submissionId){
    const { data, error } = await Votes.getBySubmissionId(submissionId);

    if (error) {
        return {
            error,
            status: 400
        };
    }

    return { data };
}

export async function getUserVotebySubmissionId(submissionId, userId){

    return await Votes.getBySubmissionIdAndUserId(submissionId, userId);

}

export async function getVote(id){

    return await Votes.getById(id);

}

export async function updateVote(id,body){

    return await Votes.update(id,body);

}

export async function deleteVote(id){

    return await Votes.delete(id);

}

function validateVoteBody(body) {
    if (!body || !["Yes", "No"].includes(body.vote)) {
        return "Vote must be Yes or No";
    }

    if (body.vote === "Yes" && !body.type_of_scam) {
        return "type_of_scam is required for Yes votes";
    }

    return null;
}

export async function createSubmissionVote(submissionId, userId, body) {
    if (!userId) {
        return {
            error: { message: "Missing user id" },
            status: 401
        };
    }

    const validationError = validateVoteBody(body);

    if (validationError) {
        return {
            error: { message: validationError },
            status: 400
        };
    }

    const { data: submission, error: getSubmissionError } = await Submissions.getById(submissionId);

    if (getSubmissionError) {
        return {
            error: { message: "Submission does not exist" },
            status: 404
        };
    }

    if (submission.is_votable === false) {
        return {
            error: { message: "Voting has ended for this submission" },
            status: 409
        };
    }

    if (submission.creator == userId) {
        return {
            error: { message: "Submission owner cannot vote on their own submission" },
            status: 403
        };
    }

    const { data: existingVotes, error: getVotesError } = await Votes.getBySubmissionId(submissionId);

    if (getVotesError) {
        return {
            error: getVotesError,
            status: 400
        };
    }

    const hasVoted = (existingVotes || []).some((vote) => vote.voter == userId);

    if (hasVoted) {
        return {
            error: { message: "User has already voted on this submission" },
            status: 409
        };
    }

    const voteData = {
        vote: body.vote,
        submission: submissionId,
        voter: userId
    };

    if (body.vote === "Yes") {
        voteData.type_of_scam = body.type_of_scam;
    }

    const { data, error: createVoteError } = await Votes.create(voteData);

    if (createVoteError) {
        return {
            error: createVoteError,
            status: 400
        };
    }

    const totalVotes = (submission.total_votes || 0) + 1;
    const yesVotes = body.vote === "Yes"
        ? (submission.yes_votes || 0) + 1
        : (submission.yes_votes || 0);

    const { error: updateSubmissionError } = await Submissions.update(submissionId, {
        total_votes: totalVotes,
        yes_votes: yesVotes
    });

    if (updateSubmissionError) {
        const createdVote = Array.isArray(data) ? data[0] : data;

        if (createdVote && createdVote.id) {
            await Votes.delete(createdVote.id);
        }

        return {
            error: updateSubmissionError,
            status: 400
        };
    }

    const { data: user, error: getUserError } = await User.getById(userId);

    if (getUserError) {
        return { error: getUserError,
            status: 400
         };
    }

    const { error: updateUserError } = await User.update(userId, {
        total_votes: user.total_votes + 1
    });

    if (updateUserError) {
        return { error: updateUserError,
            status: 400
        };
    }

    return {
        data: {
            vote: Array.isArray(data) ? data[0] : data,
            submission: {
                id: submissionId,
                total_votes: totalVotes,
                yes_votes: yesVotes
            }
        }
    };
}

export async function updateSubmissionVote(id, userId, body) {
    if (!userId) {
        return {
            error: { message: "Missing user id" },
            status: 401
        };
    }

    const validationError = validateVoteBody(body);

    if (validationError) {
        return {
            error: { message: validationError },
            status: 400
        };
    }

    const { data: vote, error: getVoteError } = await Votes.getById(id);

    if (getVoteError) {
        return {
            error: { message: "Vote does not exist" },
            status: 404
        };
    }

    if (!vote || vote.voter != userId) {
        return {
            error: { message: "Unauthorized" },
            status: 401
        };
    }

    const { data: submission, error: getSubmissionError } = await Submissions.getById(vote.submission);

    if (getSubmissionError) {
        return {
            error: { message: "Submission does not exist" },
            status: 404
        };
    }

    if (submission.is_votable === false) {
        return {
            error: { message: "Voting has ended for this submission" },
            status: 409
        };
    }

    const voteData = {
        vote: body.vote,
        type_of_scam: body.vote === "Yes" ? body.type_of_scam : null
    };

    const { data: updatedVote, error: updateVoteError } = await Votes.update(id, voteData);

    if (updateVoteError) {
        return {
            error: updateVoteError,
            status: 400
        };
    }

    const wasYesVote = vote.vote === "Yes";
    const isYesVote = body.vote === "Yes";
    const yesVoteChange = wasYesVote === isYesVote ? 0 : isYesVote ? 1 : -1;
    const yesVotes = Math.max((submission.yes_votes || 0) + yesVoteChange, 0);

    if (yesVoteChange === 0) {
        return {
            data: {
                vote: Array.isArray(updatedVote) ? updatedVote[0] : updatedVote,
                submission: {
                    id: vote.submission,
                    yes_votes: yesVotes,
                    total_votes: submission.total_votes || 0
                }
            }
        };
    }

    const { error: updateSubmissionError } = await Submissions.update(vote.submission, {
        yes_votes: yesVotes
    });

    if (updateSubmissionError) {
        await Votes.update(id, {
            vote: vote.vote,
            type_of_scam: vote.type_of_scam
        });

        return {
            error: updateSubmissionError,
            status: 400
        };
    }

    return {
        data: {
            vote: Array.isArray(updatedVote) ? updatedVote[0] : updatedVote,
            submission: {
                id: vote.submission,
                yes_votes: yesVotes,
                total_votes: submission.total_votes || 0
            }
        }
    };
}
