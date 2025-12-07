export class Repartition {
    user_id!: number;
    weight!: number;

    constructor(userId: number, weight: number = 1) {
        this.user_id = userId;
        this.weight = weight;
    }
}