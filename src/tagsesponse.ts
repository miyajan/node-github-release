export default interface TagsResponse {
    data: TagObject[]
}

export interface TagObject {
    name: string
    commit: CommitObject
}

export interface CommitObject {
    url :string
}
