import * as React from 'react';
import { getEWordClassString, getWordClassArr, MPTypes } from 'myprodict-model/lib-esm';

interface SelectWordClassProps {
  value: MPTypes.WordClass;
  onWClassChange?(value: string): any;
}

export default (props: SelectWordClassProps) => {
  const handleWClassChange = (e: any) => props.onWClassChange && props.onWClassChange(e.target.value);

  return (
    <select
      className="form-control"
      value={props.value}
      onChange={handleWClassChange}
    >
      {getWordClassArr().map(e =>
        <option key={e} value={e}>{getEWordClassString(e)}</option>)}
    </select>
  );
};
