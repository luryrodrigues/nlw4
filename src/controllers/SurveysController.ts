import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { SurveysRepository } from '../repositories/SurveysRepository';

class SurveyController {
  show(arg0: string, show: any) {
    throw new Error('Method not implemented.');
  }

  async create(req: Request, res: Response) {
    const {title, description} = req.body;

    const surveysRepository = getCustomRepository(SurveysRepository);

    const survey = surveysRepository.create({
      title, description 
    })

    await surveysRepository.save(survey);

    return res.status(201).json(survey);
  }
}

export { SurveyController };
