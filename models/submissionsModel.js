import supabase from "../config/supabase";

class Submissions {

    static async create(data){

        return await supabase
            .from("submissions")
            .insert(data)
            .select();

    }

    static async getAll(){

        return await supabase
            .from("submissions")
            .select("*")
            .order('created_at', { ascending: false })

    }

    static async getById(id){

        return await supabase
            .from("submissions")
            .select("*")
            .eq("id",id)
            .single();

    }

    static async update(id,data){

        return await supabase
            .from("submissions")
            .update(data)
            .eq("id",id)
            .select();

    }

    static async updatebyCreator(id, userId, data){

        return await supabase
            .from("submissions")
            .update(data)
            .eq("id",id)
            .eq("creator",userId)
            .select();
    }

    static async delete(id){

        return await supabase
            .from("submissions")
            .delete()
            .eq("id",id)
            .select();

    }

    static async deleteByCreator(id, userId){

        return await supabase
            .from("submissions")
            .delete()
            .eq("id",id)
            .eq("creator",userId)
            .select();

    }

    static async getByCreator(userId){

        return await supabase
            .from("submissions")
            .select("*")
            .eq("creator",userId)
            .select()
            .order('created_at', { ascending: false })

    }

}

export default Submissions;