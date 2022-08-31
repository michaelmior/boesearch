import React from 'react';
import { FaMap } from "react-icons/fa";

function AddressBlock({address}) {
  return (address[0] !== "undefined" && address.join('').trim().length > 0) ?
    <React.Fragment>
      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.join(' '))}`} target="_blank" rel="noreferrer">
        <FaMap style={{float: 'left', marginRight: '1em'}}/>
      </a>
      <div style={{float: 'left'}}>
        {address.filter(line => line.indexOf('undefined') === -1)
                .map((line, i) =>
                  <React.Fragment key={i}>
                    {line}<br/>
                  </React.Fragment>)}
      </div>
    </React.Fragment> : <></>;
}

export default AddressBlock;
