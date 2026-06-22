import supabase from "../config/supabase";

class Logs {

    static async create(data) {

        return await supabase
            .from("logs")
            .insert(data)
            .select()
            .single();

    }

    static async getAll() {

        return await supabase
            .from("logs")
            .select("*")
            .order("created_at", { ascending: false });

    }

    static async getById(id) {

        return await supabase
            .from("logs")
            .select("*")
            .eq("id", id)
            .single();

    }

    static async getByUser(userId) {

        return await supabase
            .from("logs")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

    }

    static async getByType(type) {

        return await supabase
            .from("logs")
            .select("*")
            .eq("type", type)
            .order("created_at", { ascending: false });

    }

}

export default Logs;
