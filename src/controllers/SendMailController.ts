import { Request, Response } from 'express';
import { resolve } from 'path';
import { getCustomRepository } from 'typeorm';
import { SurveysRepository } from '../repositories/SurveysRepository';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';
import { UsersRepository } from '../repositories/UsersRepository';
import SendMailService from '../services/SendMailService';

class SendMailController {
  async execute(req: Request, res: Response){
    const {email, survey_id} = req.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const user = await usersRepository.findOne({email});

    if (!user) {
      return res.status(400).json({
        error: 'User does not exist'
      });
    }

    const survey = await surveysRepository.findOne({id: survey_id})

    if(!survey) {
      return res.status(400).json({
        error: 'Survey does not exist'
      });
    }


    const npsPath = resolve(__dirname, '..','views', 'emails', 'npsMail.hbs');

    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: {user_id: user.id, value: null},
      relations: ["user", "survey"]
    });

    const variables = {
      name: user.name,
      title: survey.title,
      description:survey.description,
      id: "",
      link: process.env.URL_MAIL
    };

    if(surveyUserAlreadyExists) {
      variables.id =  surveyUserAlreadyExists.id;
      await SendMailService.execute(email, survey.title, variables, npsPath);
      return res.json(surveyUserAlreadyExists);
    }

    //Salvar info na tabela survey_user
    const surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id
    });

    await surveysUsersRepository.save(surveyUser);

    //Enviar email para usuário
    variables.id = surveyUser.id;
    
    await SendMailService.execute(email, survey.title, variables, npsPath);

    return res.json(surveyUser);
  }
}

export {SendMailController}