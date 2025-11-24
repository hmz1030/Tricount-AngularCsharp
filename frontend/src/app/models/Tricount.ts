export class Tricount {
    constructor (
        public id: number,
        public title: string, 
        public description: string,
        public created_at: string,
        public creator: number,
        //public participants: Participants[],
        //public Operations: Operations[],
    ) {}

    static fromJson(json: any): Tricount {
        return new Tricount(
            json.id,
            json.title,
            json.description,
            json.created_at,
            json.creator
        );
    }

}