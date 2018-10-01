const { expect } = require('chai');
const sinon = require('sinon');

const db = require('../../../connect');
const UserModelRef = require('../../../models/user');

describe('user model test', () => {

  let sandbox;
  let userModel;
  let data = []
  const fakeUserId = 1
  let valueAfterUpdate;
  /*{
    user_id: 1,
    user_email: 'test@example.com',
    user_username: 'test',
    user_name: 'Foo Bar',
    user_gender: 'm',
    user_hp: '0899124556',
    user_avatar: '',
    user_is_verified: 0,
    user_is_deleted: 0,
    user_created_at: (new Date()).toISOString(),
    user_updated_at: (new Date()).toISOString()

  }]*/

  const payload = {
    user_email: 'test@example.com',
    user_username: 'test',
    user_name: 'Foo Bar',
    user_gender: 'm',
    user_hp: '0899124556',
    user_avatar: ''
  }

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(db, 'define').withArgs('user', {}).callsFake(() => 1)
    userModel = new UserModelRef()

    userModel.tableName = 'user'

    userModel.schema = {
      create: sandbox.stub().resolves({insertId: fakeUserId}),
    }

    const value = Object.assign(payload, {
      user_id: fakeUserId,
      user_is_verified: 0,
      user_is_deleted: 0,
      user_created_at: (new Date()).toISOString(),
      user_updated_at: (new Date()).toISOString()
    })

    valueAfterUpdate = value
    valueAfterUpdate.user_name = 'Foo Bar edit'

    data.push(value)

    userModel.schema = Object.assign(userModel.schema, {
      findOne: sandbox.stub().resolves(value),
      findAll: sandbox.stub().resolves(data),
      update: sandbox.stub().resolves([
        {
          affectedCount: 1,
          affectedRows: 1
        }
      ]),
      destroy: sandbox.stub().resolves(undefined),
    })
  });

  afterEach(() => {
    sandbox.restore();
    userModel = null
    data = []
    valueAfterUpdate = null
    //mockArgs = null;
    //avgBalanceDbConnector = null;
  });

  it('should call create and right value', async () => {
    const insertRow = await userModel.create(payload);
    expect(userModel.schema.create.callCount).to.equal(1);
    expect(insertRow).deep.equal({insertId: fakeUserId})
  });

  it('should call findOne and right value', async () => {
    const query = {
      user_id: fakeUserId
    }
    const dataUser = await userModel.findOne(query)
    expect(userModel.schema.findOne.callCount).to.equal(1)
    expect(dataUser).deep.equal(data[0])
  });

  it('should call find  and right value', async () => {
    const dataUser = await userModel.find()
    expect(userModel.schema.findAll.callCount).to.equal(1)
    expect(dataUser).deep.equal(data)
  });

  it('should call find with first arguments query and right value', async () => {
    const query = {
      user_is_verified: 0
    }

    const dataUser = await userModel.find(query)
    expect(userModel.schema.findAll.callCount).to.equal(1)

    const filterData = data.filter(val => {
      return val.user_is_verified === 0
    })
    expect(dataUser).deep.equal(filterData)
  });

  it('should call find with second argument option and right value', async () => {
    const option = {
      limit: 10,
      sort: ['user_id', 'desc'],
      page: 1
    }

    const dataUser = await userModel.find({}, option)
    expect(userModel.schema.findAll.callCount).to.equal(1)
    expect(dataUser).deep.equal(data)
  });

  it('should call find with arguments and right value', async () => {
    const query = {
      user_is_verified: 0
    }

    const option = {
      limit: 10,
      sort: ['user_id', 'desc'],
      page: 1
    }

    const dataUser = await userModel.find(query, option)
    expect(userModel.schema.findAll.callCount).to.equal(1)
    expect(dataUser).deep.equal(data)
  });

  it('should call update and right value', async () => {
    const query = {
      user_id: fakeUserId
    }

    const payload = {
      user_name: 'Foo Bar edit'
    }

    const upd = await userModel.update(query, payload)
    expect(userModel.schema.update.callCount).to.equal(1)
    expect(upd).deep.equal([
      {
        affectedCount: 1,
        affectedRows: 1
      }
    ])
  });

  it('should call remove', async () => {
    const query = {
      user_id: fakeUserId
    }

    const del = await userModel.remove(query);
    expect(userModel.schema.destroy.callCount).to.equal(1);
    expect(del).is.true;
  });
});
