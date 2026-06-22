import supabase from "../config/supabase";

class User {

    static async create(data){

        return await supabase
            .from("users")
            .insert(data)
            .select()
            .single();

    }

    static async getAll(){

        return await supabase
            .from("users")
            .select('id, username, email, score, total_submission, total_votes')
            .order('score', { ascending: false })

    }

    static async getById(id){

        return await supabase
            .from("users")
            .select('id, username, email, score, total_submission, total_votes')
            .eq("id",id)
            .single();

    }

     static async getByEmailWithPassword(email){

        return await supabase
            .from("users")
            .select('id, email, password, username')
            .eq("email",email)
            .single();

    }

    static async update(id,data){

        return await supabase
            .from("users")
            .update(data)
            .eq("id",id)
            .select();

    }

    static async delete(id){

        return await supabase
            .from("users")
            .delete()
            .eq("id",id)
            .select();

    }
}

export default User;