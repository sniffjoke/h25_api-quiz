import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamePairEntity } from '../domain/game-pair.entity';
import { GameStatuses } from '../api/models/input/create-pairs-status.input.model';
import { PaginationBaseModel } from '../../../core/base/pagination.base.model';
import { BlogViewModel } from '../../blogs/api/models/output/blog.view.model';
import { QuestionEntity } from '../domain/question.entity';
import { QuestionViewModel } from '../api/models/output/question.view.model';
import { PublishedStatuses } from '../api/models/input/update-publish-status.input.model';


@Injectable()
export class QuizQueryRepositoryTO {

  constructor(
    @InjectRepository(GamePairEntity) private readonly gRepository: Repository<GamePairEntity>,
    @InjectRepository(QuestionEntity) private readonly questionRepository: Repository<QuestionEntity>,
  ) {
  }

  async getGame() {
    const item = await this.gRepository
      .createQueryBuilder('g')
      .where('g.status = :status', { status: GameStatuses.Active })
      .getOne();
    // console.log(items);
    return item;
  }

  async getAllQuestionsWithQuery(query: any) {
    const generateQuery = await this.generateQuery(query);
    const items = this.questionRepository
      .createQueryBuilder('q')
      .where('LOWER(q.body) LIKE LOWER(:name)', { name: generateQuery.bodySearchTerm.toLowerCase() })
      // .andWhere('q.published = :status', generateQuery.publishedStatus === PublishedStatuses.PUBLISHED ? { status: true} : {})
      // .andWhere('q.published = :status', generateQuery.publishedStatus === PublishedStatuses.NOTPUBLISHED ? { status: false} : {})
      // .andWhere(
      //   generateQuery.publishedStatus === PublishedStatuses.ALL
      //     ? '1 = 1'
      //     : 'q.published = :status',
      //   generateQuery.publishedStatus === PublishedStatuses.ALL ? {} : { status: true },
      // )
      .orderBy(`"${generateQuery.sortBy}"`, generateQuery.sortDirection.toUpperCase())
      .skip((generateQuery.page - 1) * generateQuery.pageSize)
      .take(generateQuery.pageSize);
    if (generateQuery.publishedStatus === PublishedStatuses.PUBLISHED) {
      items.andWhere('q.published = :status', { status: true });
    } else if (generateQuery.publishedStatus === PublishedStatuses.NOTPUBLISHED) {
      items.andWhere('q.published = :status', { status: false });
    }
    const itemsWithQuery = await items
      .getMany();
    const itemsOutput = itemsWithQuery.map(item => this.questionOutputMap(item));
    const resultQuestions = new PaginationBaseModel<QuestionViewModel>(generateQuery, itemsOutput);
    return resultQuestions;
  }

  private async generateQuery(query: any) {
    const bodySearchTerm: string = query.bodySearchTerm ? query.bodySearchTerm : '';
    const publishedStatus: string = query.publishedStatus ? query.publishedStatus : 'All';
    const totalCount = await this.questionRepository
      .createQueryBuilder('q')
      .where('LOWER(q.body) LIKE LOWER(:name)', { name: `%${bodySearchTerm.toLowerCase()}%` })
      // .andWhere('q.published = :status', publishedStatus === PublishedStatuses.PUBLISHED ? { status: true} : {})
      // .andWhere('q.published = :status', publishedStatus === PublishedStatuses.NOTPUBLISHED ? { status: false} : {})
      .getCount();
    const pageSize = query.pageSize ? +query.pageSize : 10;
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      totalCount,
      pageSize,
      pagesCount,
      page: query.pageNumber ? Number(query.pageNumber) : 1,
      sortBy: query.sortBy ? query.sortBy : 'createdAt',
      sortDirection: query.sortDirection ? query.sortDirection : 'desc',
      bodySearchTerm: '%' + bodySearchTerm + '%',
      publishedStatus,
    };
  }

  async questionOutput(id: string) {
    const findedQuestion = await this.questionRepository.findOne({
      where: { id },
    });
    if (!findedQuestion) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
    return this.questionOutputMap(findedQuestion);
  }

  questionOutputMap(question: QuestionEntity): QuestionViewModel {
    const { id, body, correctAnswers, published, createdAt, updatedAt } = question;
    return {
      id: id.toString(),
      body,
      correctAnswers,
      published,
      createdAt,
      updatedAt,
    };
  }

}
