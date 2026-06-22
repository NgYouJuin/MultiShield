import { NextResponse } from "next/server";

import {

createUser,
getUsers

} from "../../../controllers/userController";


export async function POST(req){

    try{

        const body=
        await req.json();

        const {data,error}
        =await createUser(body);

        if(error){

            return NextResponse.json(
                {
                    success: false,
                    message: "Creating User Failed"
                },
                {status:400}
            );

        }

        return NextResponse.json(
            {
                success: true,
                data
            },
            {status:200}
        );

    }

    catch(err){

        return NextResponse.json(
            {
                success: false,
                message: "Creating User Failed"
            },
            {status:400}
        );

    }

}


export async function GET(){

    const {data,error}
    =await getUsers();

    if(error){

        return NextResponse.json(
            {
                success: false,
                message: "Getting Users Failed"
            },
            {status:400}
        );

    }

    return NextResponse.json(
        {
            success: true,
            data
        },
        {status:200}
    );

}