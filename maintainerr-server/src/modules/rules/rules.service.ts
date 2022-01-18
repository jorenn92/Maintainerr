import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Property, RuleConstants } from './constants/rules.constants';
import { RuleDto } from './dtos/rule.dto';
import { RulesDto } from './dtos/rules.dto';
import { RuleGroup } from './entities/rule-group.entities';
import { Rules } from './entities/rules.entities';

export interface ReturnStatus {
  code: 0 | 1;
  result: string;
}

@Injectable()
export class RulesService {
  ruleConstants: RuleConstants;
  constructor(
    @InjectRepository(Rules) private rulesRepository: Repository<Rules>,
    @InjectRepository(RuleGroup)
    private ruleGroupRepository: Repository<RuleGroup>,
    private connection: Connection,
  ) {
    this.ruleConstants = new RuleConstants();
  }
  get getRuleConstants(): RuleConstants {
    return this.ruleConstants;
  }
  async getRules(ruleGroupId: string): Promise<Rules[]> {
    return await this.connection
      .getRepository(Rules)
      .createQueryBuilder('rules')
      .where('ruleGroupId = :id', { id: ruleGroupId })
      .getMany();
  }
  async getRuleGroups(activeOnly = false): Promise<RulesDto[]> {
    const rulegroups = await this.connection
      // .getRepository(RuleGroup)
      .createQueryBuilder('rule_group', 'rg')
      // .select(['id', 'name', 'description', 'isActive'])
      .leftJoinAndSelect('rg.rules', 'r')
      .orderBy('r.id')
      .where(activeOnly ? 'rg.isActive = true' : '')
      .getMany();
    return rulegroups as RulesDto[];
  }

  async setRules(params: RulesDto) {
    // {
    //   "name": "test",
    //   "description": "dit is een test",
    //   "libraryId" : 1,
    //   "active": true,
    //   "rules" : [
    //     { "operator": null, "firstVal": [1,0], "lastVal": [3,1],"action": 2},
    //     { "operator": 0, "firstVal": [0,0], "lastVal": [1,0],"action": 1}
    //   ]
    // }

    let state: ReturnStatus = this.createReturnStatus(true, 'Success');
    params.rules.forEach((rule) => {
      if (state.code === 1) {
        state = this.validateRule(rule);
      }
    }, this);
    if (state.code === 1) {
      const groupId = await this.createNewGroup(
        params.name,
        params.description,
        params.libraryId,
        params.isActive ? params.isActive : true,
      );
      params.rules.forEach(async (rule) => {
        const ruleJson = JSON.stringify(rule);
        await this.connection
          .createQueryBuilder()
          .insert()
          .into(Rules)
          .values([{ ruleJson: ruleJson, ruleGroupId: groupId }])
          .execute();
      });
      // execute for the first time
      return state;
    } else {
      return state;
    }
  }

  private validateRule(rule: RuleDto): ReturnStatus {
    try {
      const val1: Property = this.ruleConstants.applications
        .find((el) => el.id === rule.firstVal[0])
        .props.find((el) => el.id === rule.firstVal[1]);
      if (rule.lastVal) {
        const val2: Property = this.ruleConstants.applications
          .find((el) => el.id === rule.lastVal[0])
          .props.find((el) => el.id === rule.lastVal[1]);
        if (val1.type === val2.type) {
          if (val1.type.possibilities.includes(rule.action)) {
            return this.createReturnStatus(true, 'Success');
          } else {
            return this.createReturnStatus(
              false,
              'Action is not supported on type',
            );
          }
        } else {
          return this.createReturnStatus(false, "Types don't match");
        }
      } else if (rule.customVal) {
        if (val1.type.toString() === rule.customVal.ruleTypeId.toString()) {
          if (val1.type.possibilities.includes(rule.action)) {
            return this.createReturnStatus(true, 'Success');
          } else {
            return this.createReturnStatus(
              false,
              'Action is not supported on type',
            );
          }
        }
      } else {
        return this.createReturnStatus(false, 'No second value found');
      }
      if (!val1) {
        return this.createReturnStatus(false, 'Rule not found');
      }
    } catch {
      return this.createReturnStatus(false, 'Unexpected error occurred');
    }
  }

  private createReturnStatus(succes: boolean, result: string): ReturnStatus {
    return { code: succes ? 1 : 0, result: result };
  }

  private async createNewGroup(
    name: string,
    description: string,
    libraryId: number,
    active = true,
  ): Promise<number> {
    const groupId = await this.connection
      .createQueryBuilder()
      .insert()
      .into(RuleGroup)
      .values([
        {
          name: name,
          description: description,
          libraryId: libraryId,
          isActive: active,
        },
      ])
      .execute();
    console.log(groupId);
    return groupId.identifiers[0].id;
  }
}
