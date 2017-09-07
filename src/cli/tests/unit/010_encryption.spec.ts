import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { publicEncrypt, decrypt } from '../../encrypt';

chai.use(chaiAsPromised);
const expect = chai.expect;

const privateKey = '-----BEGIN RSA PRIVATE KEY-----\nMIIG4wIBAAKCAYEAqXViXp9Tybmh3kqsxZSUbfAUmk'
  + '7XXtj+eB8UJXj7rY+6rGu3\nJ5AdbtvE43DHMYAnUZ3cPtXHOeggOYo36bFXXHDY5dvF+MtDDIJuaS1Kt9/W2Cmp\n'
  + 'avlrzTS+DgC9Njin7Xb+Cg/ht7EogUKGqqTIw920Ql1PZFoo2J+8ZdqSAa8blz/w\nKlgSvkk358nRl+4DWebtLnzD'
  + '42E0zmRSo8rXhkdBs2yStc7lZBUenaBojkCRdNqD\nJwaFFHbNJsD6KjpmhQrYWK47+N0xpwpUA0ewb/IqbpfDXKun'
  + 'nkdxtMjzB7u4OIfG\nG/nBFLEFmQZRRdNQ3VCwuKLAEWgJMVA6Ljh6OTd9VZrUAlxes0YfAFgEfK9yGgIt\nF39e5R'
  + 'anBGUKGnxEPXljgCQfQ3Q5PxhpoUPZeN5T+IeuASjn6FgEW53r2ie/1h7C\nNUc7IbR5Ht3LpT50p1Pi5m/k0oqwVe'
  + '0Gc5b+QGFRDpEdVUt6OVyAB5az5kAjoJtA\nsjxPWWlAoMC5PbiVAgMBAAECggGBAJ5kSusYz49pRKRrdixD4a0Uz5'
  + '0f/mz4NHqA\nyirwd4ZWJu0MzahcKza4ksLoYjehip7eB8Rvu4UjtCM0T2jOy1JrZEENeHFBRE2I\nCL2kiQdvYPix'
  + 'kFqeAiZPmymphTIOKOBr7a3oBFnXbH3NeeQ8nC9/pgK2BwRMxYsd\nW1J0xy5tx0NLjyd1JSfZdjjgSllRLq60i5N9'
  + 'KPf6nwofeaMBcQxgxEd6P3NSjNVM\nbE53ZeM49PydViN/E5r6JG2JyQr5g9h3GfQVp/J2CbNeBQIZK7/oLcqFi7Ya'
  + 'Q0fU\nuz47g8QvtyxgkAxHC2Hn1XJEe0MsIOYUWym0c6EngYenlM3NxwH+eX59iIAtvnkO\nNiZyEECNA3GI3rCMnz'
  + '6WHOjjEYPs6qpobX7iCJt1GiVbH3yp0EHrQbE/8oONDoGu\n+5epkgXfqBH04ev3edivL3RIXMG17dK2/mC6XRfEKG'
  + 'DJ1V9MK1vU3cj4EDv1TfXC\n/TOqqGfLaH6YkOMnsCorPchuWz7njQKBwQD4iucYwlfBC6N9cmk8or5Td7ovCK4B\n'
  + 'AH9Nkz7ZgHJYrtFmwq8mH42aIkKWJbbNoP1uMY9qcAzmKuE7hXbuln6VQrq/SYGS\ne1i9NzkBwpeQyNjD4B0UprWV'
  + 'B4P1GEf8jN2epvlhdfxDrOe077hBIzWPfZ/4q76s\nrtDlCgskgjkOtSwj+ifpisag7L2gImTj0E1RSBDYZkf0IzZS'
  + 'tpu7UzgZQK4Qw8VZ\nMJYM8JjHiu0eSw+RhpgJRQKCQ2bc5nwCgX8CgcEArosGDXOxELCJFDfqxoSolneH\n9BY+TW'
  + 'Wi5Ynwa91njle28oB2cge4rx0BOr56jQcgSPcY7AHXKCqrRGi5EiDMieJ/\n4Emx9uSCl2+edTPpShN1Ja/9Dp0I3g'
  + 'fPE4d5H+KPZhpENbWIHWwZNR32KRISfOku\nnM+6iqCjRxEeyXfspxcyWFNeFXO0sp/WhxynRK07IUCPgOwnqjspIm'
  + 'aBWWE/ICsX\nGsfeQndvF1eeOLqdFYwsSye8BeUC0g9nooLNCafrAoHAYiPG+NnUeN+1oNVKhKzm\nZmMCW4wb2T1v'
  + 'Bxy7VnsHq8jr2p3JN06CRXh9vngJ5MxLBfX/4VF5ZnFMGoqq2a8H\nMLz2rI3D4ilecuiZU/6Yho0oOsAF+5+QV9Zt'
  + '3pvF4Q1mfT0Ff9xszfQ6UhHOObpD\nbfN29WQrmFg3GBmNKM9a5FnZoiMnG2q239hbUB4EpIgd35iLPke05cv5qVN9'
  + 'zswf\nfKkzkl8bUAqFVXqzeSd8Vdfhv97brd1YDkO7HELOeNbVAoHABVsYvXLuXP+9xRQO\nLTdG4Q8b6d6A3OkgfY'
  + 'ClEvpBQjno0Dom6EraXO0762yK4Cb206ZZamyICKB+juPT\nwf2lqRl9KQm530SVyUXQi/Ii13YPYy+qSTeCXSXKMe'
  + 'Q3UEYodk6aBzfhzF1TzLB1\nrD70uEaDeqZZKAXT3MtmsXHvnhT1I4azXV8mjVCgSZcUfuP964BKpv8YHH4iPf79\n'
  + 'Oxvjzv3jgJvfcxStIP88SKtZRJ7/gPLgLyIe2wlD+dWfqwsvAoHADv0MDof9+st6\nUJLaRqL89M54niwh96Bv+hdM'
  + 'e1lLngSKTZ4UMGGAoqwXRzUEEeuz+uHPpnPcKwgF\nK37dUka1lomiCgv9dipMYbkcDRS2iBXe41EaNzDvpCsp6fvS'
  + 'idwSFh4Avjq3YMDq\n0tPIdi44faPO/hP7Rqr05Ks5bgTrLmKdwWkCeWLv+u/0v8BvYCHldE+Db2fsKTT/\nCPy+pm'
  + 'vCUUm4WrCeNoTLlyWI8RJQLMKLGbCIjhpp83TGsyVAzXsm\n-----END RSA PRIVATE KEY-----';

const publicKey = '-----BEGIN PUBLIC KEY-----\nMIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAqXVi'
  + 'Xp9Tybmh3kqsxZSU\nbfAUmk7XXtj+eB8UJXj7rY+6rGu3J5AdbtvE43DHMYAnUZ3cPtXHOeggOYo36bFX\nXHDY5d'
  + 'vF+MtDDIJuaS1Kt9/W2CmpavlrzTS+DgC9Njin7Xb+Cg/ht7EogUKGqqTI\nw920Ql1PZFoo2J+8ZdqSAa8blz/wKl'
  + 'gSvkk358nRl+4DWebtLnzD42E0zmRSo8rX\nhkdBs2yStc7lZBUenaBojkCRdNqDJwaFFHbNJsD6KjpmhQrYWK47+N'
  + '0xpwpUA0ew\nb/IqbpfDXKunnkdxtMjzB7u4OIfGG/nBFLEFmQZRRdNQ3VCwuKLAEWgJMVA6Ljh6\nOTd9VZrUAlxe'
  + 's0YfAFgEfK9yGgItF39e5RanBGUKGnxEPXljgCQfQ3Q5PxhpoUPZ\neN5T+IeuASjn6FgEW53r2ie/1h7CNUc7IbR5'
  + 'Ht3LpT50p1Pi5m/k0oqwVe0Gc5b+\nQGFRDpEdVUt6OVyAB5az5kAjoJtAsjxPWWlAoMC5PbiVAgMBAAE=\n-----E'
  + 'ND PUBLIC KEY-----';

describe('Encrypt decrypt functionality', () => {

  it(`should return encrypted string`, function() {
    return publicEncrypt('test', publicKey)
      .then(encrypted => expect(encrypted).to.have.length(512));
  });

  it(`should encrypt and decrypt string and return the original string`, function () {
    return publicEncrypt('test', publicKey)
      .then(encrypted => decrypt(encrypted, privateKey))
      .then(decrypted => expect(decrypted).to.equal('test'));
  });
});
