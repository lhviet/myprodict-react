import * as React from 'react';
import * as _ from 'lodash-es';
import { MPTypes, getStatusString, getStatusArr } from 'myprodict-model/lib-esm';

const getButtonClass = (status?: MPTypes.Status) => {
  switch (status) {
    case MPTypes.Status.Pending:
      return 'btn btn-warning';
    case MPTypes.Status.Processing:
      return 'btn btn-info';
    case MPTypes.Status.Disabled:
      return 'btn btn-secondary';
    case MPTypes.Status.Active:
      return 'btn btn-primary';
    case MPTypes.Status.Rejected:
      return 'btn btn-danger';
    default:
      return 'btn btn-outline-secondary';
  }
};

interface ButtonStatusProps {
  statusNumber?: MPTypes.Status;
  onClickStatus?(value: MPTypes.Status): any;
}

export default ({ statusNumber, onClickStatus }: ButtonStatusProps) => {
  const onClick = (status: MPTypes.Status) => onClickStatus ? onClickStatus(status) : undefined;
  const statuses = getStatusArr();
  const btns: React.ReactNode = statuses.map((stt, index) => (
    <button
      type="button"
      key={index}
      className={getButtonClass(stt === statusNumber ? stt : undefined)}
      onClick={_.partial(onClick, stt)}
    >
      {getStatusString(stt)}
    </button>
  ));

  return (
    <div className="btn-group btn-group-sm" role="group" aria-label="Status">
      {btns}
    </div>
  );
};
