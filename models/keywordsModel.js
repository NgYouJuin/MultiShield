import supabase from "../config/supabase";

class Keywords {

    static async create(data){

        return await supabase
            .from("keywords")
            .insert(data)
            .select();

    }

    static async getAll(){

        return await supabase
            .from("keywords")
            .select("*");

    }

    static async getById(id){

        return await supabase
            .from("keywords")
            .select("*")
            .eq("id",id)
            .single();

    }

    static async getByWordAndType(keyword, type){

        return await supabase
            .from("keywords")
            .select("*")
            .eq("keyword",keyword)
            .eq("type_of_scam",type)
            .maybeSingle();

    }

    static async update(id,data){

        return await supabase
            .from("keywords")
            .update(data)
            .eq("id",id)
            .select();

    }

    static async delete(id){

        return await supabase
            .from("keywords")
            .delete()
            .eq("id",id);

    }

}

export default Keywords;