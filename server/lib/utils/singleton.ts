export class Singleton
{
    private static instance: Singleton;

    public challengers = {};

    //public challengers:string[];
    //public times:number[]
    //public challenged:string[];

    private constructor(){ /*this.challengers = []; this.times = []; this.challenged = []*/ }

    public static getInstance(): Singleton
    {
        if(!Singleton.instance)
        {
            Singleton.instance = new Singleton();
        }
        return Singleton.instance;
    }
}