import { NextResponse } from "next/server";
import { getKeywords } from "../../../controllers/keywordsController";

export async function GET(){

    const {data,error}
    =await getKeywords();

    return NextResponse.json(
        data
    );

}