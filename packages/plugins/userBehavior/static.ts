export const UploadTarget = {
  userBehaviorTarget: 'user-behavior',
  visitInfoTarget: 'visit-info'
};

export enum BehaviorType {
  routerChange = 'router-change',
  operation = 'operation',
  request = 'request'
}

export enum RequestType {
  get = 'GET',
  post = 'POST',
  put = 'PUT',
  del = 'DELETE',
  options = 'OPTIONS',
  head = 'HEAD'
}
