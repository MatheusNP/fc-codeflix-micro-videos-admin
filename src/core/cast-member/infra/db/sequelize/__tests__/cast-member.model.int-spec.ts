import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CastMemberModel } from '../cast-member.model';
import { DataType } from 'sequelize-typescript';

describe('CastMemberModel Integration Tests', () => {
  setupSequelize({
    models: [CastMemberModel],
  });

  test('mapping props', () => {
    const attributesMap = CastMemberModel.getAttributes();
    const attributes = Object.keys(CastMemberModel.getAttributes());

    expect(attributes).toStrictEqual([
      'cast_member_id',
      'name',
      'type',
      'created_at',
    ]);

    expect(attributesMap.cast_member_id).toMatchObject({
      type: DataType.UUID(),
      primaryKey: true,
      field: 'cast_member_id',
      fieldName: 'cast_member_id',
    });

    expect(attributesMap.name).toMatchObject({
      type: DataType.STRING(255),
      allowNull: false,
      field: 'name',
      fieldName: 'name',
    });

    expect(attributesMap.type).toMatchObject({
      type: DataType.SMALLINT(),
      allowNull: false,
      field: 'type',
      fieldName: 'type',
    });

    expect(attributesMap.created_at).toMatchObject({
      type: DataType.DATE(3),
      allowNull: false,
      field: 'created_at',
      fieldName: 'created_at',
    });
  });

  test('should create a cast member', async () => {
    const arrange = {
      cast_member_id: '123e4567-e89b-12d3-a456-426655440000',
      name: 'test',
      type: 1,
      created_at: new Date(),
    };
    const castMember = await CastMemberModel.create(arrange);
    expect(castMember.toJSON()).toStrictEqual(arrange);
  });
});
