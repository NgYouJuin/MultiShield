import User from "../models/userModel";
import bcrypt from "bcrypt";

export async function createUser(body){

    const hashedPassword =
    await bcrypt.hash(
        body.password,
        10
    );

    return await User.create({

        ...body,
        password: hashedPassword

    });

}

export async function getUsers(){

    return await User.getAll();

}

export async function getUser(id){

    return await User.getById(id);

}

export async function updateUser(id,body){

    return await User.update(id,body);

}

export async function deleteUser(id){

    return await User.delete(id);

}