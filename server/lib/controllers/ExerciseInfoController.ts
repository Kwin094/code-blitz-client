import * as mongoose from 'mongoose';
import { ExerciseInfoSchema } from '../models/ExerciseInfoModel';
import { Request, Response } from 'express';

mongoose.pluralize(null);

const ExerciseInfo = mongoose.model('ExerciseInfo', ExerciseInfoSchema);

export class ExerciseInfoController
{
    public getExerciseInfo (req: Request, res: Response) {           
        ExerciseInfo.find({}, (err, exercise) => {
            if(err){
                res.send(err);
            }
            res.json(exercise); 
        });
    }

    public compareAnswer (req: Request, res: Response)
    {
        var logBackup = console.log;
        var logAnswer;

        console.log = function() {
            logAnswer = arguments[0];
            logBackup.apply(console, arguments);
        };

        try { eval(req.body['_code']); }
        catch{ res.json({result: false}) }

        ExerciseInfo.findOne({'title':req.body["_title"]}, (err, exercise) => {
            if(err){
                res.send(err);
            }
            exercise['solutions'].forEach(element => {
                if(req.body['_code'].includes(element['prologue']))
                    res.json({result: logAnswer == element['solutionComparison']})
            });
        });
    }
}