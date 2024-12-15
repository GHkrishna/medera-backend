import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AgentService } from './agent.service';
import { TenantRecord } from '@credo-ts/tenants';
import { ApiBody } from '@nestjs/swagger';
import { CreateTenantOptionsDto } from './agent.dto';

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
  public resolveShortUrl(
    @Param('tenantId') tenantId: string,
    @Param('recordId') recordId: string,
  ): Promise<string> {
    return this.agentService.resolveShortUrl(tenantId, recordId);
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
  // createDid
  @Post('/getConnection')
  public async getConnection(
    @Query('tenantId') tenantId: string,
  ): Promise<object> {
    return this.agentService.getConnection(tenantId);
  }
}
