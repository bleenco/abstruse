import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { getRemoteParsedConfig } from '../../src/api/config';

chai.use(chaiAsPromised);
const expect = chai.expect;

let repo = {
  clone_url: 'https://github.com/bleenco/abstruse.git',
  branch: 'master'
};

describe('Remote git configuration', () => {

  it(`should get remote configuration from abstruse repository`, function() {
    this.timeout(60000);
    return expect(getRemoteParsedConfig(repo)).to.eventually.have.length(5);
  });

  it(`should reject with an error if '.abstruse.yml' doesn't exists`, function() {
    this.timeout(10000);
    repo.clone_url = 'http://github.com/d3/d3.git';
    return expect(getRemoteParsedConfig(repo)).to.eventually.be.rejectedWith(Error);
  });

});
