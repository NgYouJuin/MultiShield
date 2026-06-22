
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel";
import { createUser } from "./userController";
import { SignJWT } from "jose";

export async function login(email,password){

    const { data:user,error } =
    await User.getByEmailWithPassword(email);

    if(error || !user){
        return {
            error:"Invalid credentials"
        };
    }

    const validPassword =
    await bcrypt.compare(
        password,
        user.password
    );

    if(!validPassword){
        return {
            error:"Invalid credentials"
        };
    }

    const secret = new TextEncoder().encode(
        process.env.JWT_SECRET
    );

    const token = await new SignJWT({

        id:user.id,
        email:user.email,
        username:user.username

    })
    .setProtectedHeader({

        alg:"HS256"

    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

    return {
        data:{
            token,
            user:{
                id:user.id,
                email:user.email,
                username:user.username
            }
        }
    };

}

export async function signup(body){

    const { data:user,error } =
    await createUser(body)

    if(error || !user){
        console.log(error)
        return {
            error:"Sign up went wrong"
        };
    }

    const secret = new TextEncoder().encode(
    process.env.JWT_SECRET
    );

    const token = await new SignJWT({
        id:user.id,
        email:user.email,
        username:user.username
    })
    .setProtectedHeader({
        alg:"HS256"
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

    return {
        data:{
            token,
            user:{
                id:user.id,
                email:user.email,
                score:user.score,
                total_submission:
                user.total_submission,
                username:user.username
            }
        }

    };

}