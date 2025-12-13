export class Repartition {
    user!: number;
    weight!: number;

    get user_id(): number { return this.user; }
    set user_id(v: number) { this.user = v; }

    constructor(userId: number, weight: number = 1) {
        this.user = userId;
        this.weight = weight;
    }
}