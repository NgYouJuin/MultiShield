import { NextResponse }
from "next/server";
import { login } from "../../../../controllers/authController";



export async function POST(req){

    try{

        const body =
        await req.json();

        const {
            email,
            password
        } = body;

        const result =
        await login(
            email,
            password
        );

        if(result.error){

            return NextResponse.json(

                {
                    message:
                    result.error,
                    success: false
                },

                {
                    status:401
                }

            );

        }

        return NextResponse.json(
            {
                success: true,
                data: result.data
            }
        );

    }

    catch(err){

        return NextResponse.json(

            {
                success: false,
                message:
                err.message
            },

            {
                status:500
            }

        );

    }

}