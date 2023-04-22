export enum COMMAND {
  PING = '핑',
  AUTHENTICATION = '로그인',
  MULTIFACTOR_AUTH = '인증',
  STOREFRONT = '상점',
  REFRESH_AUTH = '재인증',
  TEST = 'test',
}
export enum COMMAND_ARGS {
  AUTHENTICATION_ID = '아이디',
  AUTHENTICATION_PW = '패스워드',
  AUTHENTICATION_CODE = '인증코드',
  AUTHENTICATION_SHARD = '지역',
}
