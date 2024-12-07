import { Injectable } from '@nestjs/common';

@Injectable()
export class AgentService {
    getHello(name: string): string | Promise<string> {
        return 'Hello '+name;
    }
}
