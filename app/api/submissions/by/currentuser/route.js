import { NextResponse } from "next/server";
import { getSubmissionsByCurrentUser } from "../../../../../controllers/submissionsController";

export async function GET(req){
    try {
        const userId =
            req.headers.get(
                "x-user-id"
            );

        const {data,error}
        =await getSubmissionsByCurrentUser(userId);

        if (error) {
        return NextResponse.json(
                    {
                        success: false,
                        message: "Get Submission By Current User Failed"
                    },
                    {status:400}
                );
        }

        return NextResponse.json(
            {
                success: true,
                data
            },
        );
    }catch(err){

        return NextResponse.json(

            {
                success: false,
                message: "Get Submission By Current User Failed"
            },

            {
                status:500
            }

        );

    }

}