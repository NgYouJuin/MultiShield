import supabase from "../config/supabase";

class Votes {

    static async create(data){

        return await supabase
            .from("votes")
            .insert(data)
            .select();

    }

    static async getAll(){

        return await supabase
            .from("votes")
            .select("*");

    }

    static async getById(id){

        return await supabase
            .from("votes")
            .select("*")
            .eq("id",id)
            .single();

    }

    static async getBySubmissionId(submissionId){
        return await supabase
            .from("votes")
            .select("*")
            .eq("submission",submissionId);
    }

    static async update(id,data){
        return await supabase
            .from("votes")
            .update(data)
            .eq("id",id)
            .select();

    }

    static async delete(id){
        return await supabase
            .from("votes")
            .delete()
            .eq("id",id);
    }

    static async deleteBySubmssionId(submissionId){
        return await supabase
            .from("votes")
            .delete()
            .eq("submission",submissionId);
    }

    static async getBySubmissionIdAndUserId(submissionId, userId){
        return await supabase
            .from("votes")
            .select("*")
            .eq("submission",submissionId)
            .eq("voter", userId)
            .single();
    }

}

export default Votes;