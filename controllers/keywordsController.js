import Keywords from "../models/keywordsModel";


export async function createKeyword(body){

    return await Keywords.create(body);

}

export async function getKeywords(){

    return await Keywords.getAll();

}

export async function getKeyword(id){

    return await Keywords.getById(id);

}

export async function updateKeyword(id,body){

    return await Keywords.update(id,body);

}

export async function deleteKeyword(id){

    return await Keywords.delete(id);

}