export class Singleton
{
    private static instance: Singleton;

    public challengers = {};

    private constructor(){}

    public static getInstance(): Singleton
    {
        if(!Singleton.instance)
        {
            Singleton.instance = new Singleton();
        }
        return Singleton.instance;
    }
}