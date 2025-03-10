import { CastMemberOutputMapper } from '@core/cast-member/application/use-cases/common/cast-member-output';
import { CastMember } from '@core/cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '@core/cast-member/domain/cast-member.repository';
import { instanceToPlain } from 'class-transformer';
import { CastMembersController } from 'src/nest-modules/cast-members-module/cast-members.controller';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members-module/cast-members.providers';
import { UpdateCastMemberFixture } from 'src/nest-modules/cast-members-module/testing/cast-member-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CastMembersController (e2e)', () => {
  const appHelper = startApp();

  describe('/cast-members/:id (PATCH)', () => {
    describe('should return 4XX when id is invalid or not found', () => {
      const arrange = [
        {
          id: '97aa09d0-c558-4cf4-9b30-37ce631119d5',
          expected: {
            statusCode: 404,
            message:
              'CastMember Not Found using ID 97aa09d0-c558-4cf4-9b30-37ce631119d5',
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when id is $id', ({ id, expected }) => {
        return request(appHelper.app.getHttpServer())
          .patch(`/cast-members/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    describe('should return 422 when body is invalid', () => {
      const id = '97aa09d0-c558-4cf4-9b30-37ce631119d5';
      const invalidRequest = UpdateCastMemberFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when label is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .patch(`/cast-members/${id}`)
          .send(value.send_data)
          .expect(value.expected.statusCode)
          .expect(value.expected);
      });
    });

    describe('with a valid request and params', () => {
      let castMemberRepo: ICastMemberRepository;

      beforeEach(async () => {
        castMemberRepo = appHelper.app.get<ICastMemberRepository>(
          CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBERS_REPOSITORY.provide,
        );
      });

      describe('should return 422 when throw EntityValidationError', () => {
        const invalidRequest =
          UpdateCastMemberFixture.arrangeForEntityValidationError();
        const arrange = Object.keys(invalidRequest).map((key) => ({
          label: key,
          value: invalidRequest[key],
        }));

        test.each(arrange)('when label is $label', async ({ value }) => {
          const castMember = CastMember.fake().anActor().build();
          await castMemberRepo.insert(castMember);

          return request(appHelper.app.getHttpServer())
            .patch(`/cast-members/${castMember.cast_member_id.id}`)
            .send(value.send_data)
            .expect(value.expected.statusCode)
            .expect(value.expected);
        });
      });

      describe('should update a cast member', () => {
        const arrange = UpdateCastMemberFixture.arrangeForUpdate();

        test.each(arrange)(
          'when body is $send_data',
          async ({ send_data, expected }) => {
            const castMember = CastMember.fake().anActor().build();
            await castMemberRepo.insert(castMember);

            const res = await request(appHelper.app.getHttpServer())
              .patch(`/cast-members/${castMember.cast_member_id.id}`)
              .send(send_data)
              .expect(200);

            const keysInResponse = UpdateCastMemberFixture.keysInResponse;
            expect(Object.keys(res.body)).toStrictEqual(['data']);
            expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

            const castMemberUpdated = await castMemberRepo.findById(
              castMember.cast_member_id,
            );
            const presenter = CastMembersController.serialize(
              CastMemberOutputMapper.toOutput(castMemberUpdated!),
            );
            const serialized = instanceToPlain(presenter);

            expect(res.body.data).toStrictEqual({
              id: serialized.id,
              created_at: serialized.created_at,
              ...expected,
            });
          },
        );
      });
    });
  });
});
