import { Module } from "@nestjs/common";
import { BullBoardModule as BullBoard } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';



@Module({
    imports: [
        BullBoard.forRoot({
            route: '/admin/queues',
            adapter: ExpressAdapter,
        }),

        BullBoard.forFeature({
            name: 'mail',
            adapter: BullMQAdapter,
        }),
    ],
})
export class BullBoardModule {}