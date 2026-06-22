import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req){

    const path =
    req.nextUrl.pathname;

    /*
    Public routes
    */

    if(
        path.startsWith("/api/auth") || path.startsWith("/api/extension")
    ){

        return NextResponse.next();

    }
    

    if (req.method === "OPTIONS") {

        const corsHeaders = {
            "Access-Control-Allow-Methods":
                "GET,DELETE,PATCH,POST,PUT,OPTIONS",

            "Access-Control-Allow-Headers":
                "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",

            "Access-Control-Allow-Credentials":
                "true",

            "Access-Control-Allow-Origin": "*",
            "Allow":
                "GET,DELETE,PATCH,POST,PUT,OPTIONS",
            "Vary":
                "rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch"
        };

        return new NextResponse(
            null,
            {
                status: 201,
                headers: corsHeaders
            }
        );

    }

    const authHeader =
    req.headers.get(
        "authorization"
    );

    if(!authHeader){

        return NextResponse.json(

            {
                message:
                "Unauthorized"
            },

            {
                status:401
            }

        );

    }

    try{

        const token =
        authHeader.replace(
            "Bearer ",
            ""
        );

        const secret =
        new TextEncoder().encode(
            process.env.JWT_SECRET
        );

        const {
            payload
        } = await jwtVerify(
            token,
            secret
        );

        const response = NextResponse.next();

        response.headers.set(
            "x-user-id",
            payload.id
        );

        response.headers.set(
            "x-user-email",
            payload.email
        );

        return response

    }

    catch(err){

        return NextResponse.json(

            {
                message:
                "Invalid token"
            },

            {
                status:403
            }

        );

    }

}

export const config = {

    matcher:[
        "/api/:path*"
    ]

};