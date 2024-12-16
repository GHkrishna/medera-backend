import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { AgentService } from './agent.service';
import { TenantRecord } from '@credo-ts/tenants';
import { ApiBody } from '@nestjs/swagger';
import { CreateTenantOptionsDto } from './agent.dto';
import { Response } from 'express';

@Controller('agent')
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Get('/')
  public async getHello(@Query('name') name: string): Promise<string> {
    return this.agentService.getHello(name);
  }

  @Get('/agentDetails')
  public getAgentDetails(): string {
    return this.agentService.getAgentDetails();
  }

  @Get('/:tenantId/:recordId')
  public async resolveShortUrl(
    @Param('tenantId') tenantId: string,
    @Param('recordId') recordId: string,
    @Res() res: Response,
  ) {
    const result = await this.agentService.resolveShortUrl(tenantId, recordId);
    // res.type('application/json');
    res.json(result);
  }

  @Post('/createTenant')
  @ApiBody({ type: CreateTenantOptionsDto })
  public async createTenant(
    @Body() config: CreateTenantOptionsDto,
  ): Promise<TenantRecord> {
    return this.agentService.createTenant(config);
  }

  // createDid
  @Post('/createDid')
  public async createDid(@Query('tenantId') tenantId: string): Promise<string> {
    return this.agentService.createDid(tenantId);
  }

  @Post('/resolveDid')
  public async resolveDid(@Query('did') did: string) {
    return this.agentService.resolveDid(did);
  }

  // createDid
  @Post('/getConnection')
  public async getConnection(
    @Query('tenantId') tenantId: string,
  ): Promise<object> {
    return this.agentService.getConnection(tenantId);
  }
}
