import React from 'react';
import {FaMap} from 'react-icons/fa';

function AddressBlock({address}) {
  if (address[0] !== 'undefined' && address.join('').trim().length > 0) {
    return (
      <React.Fragment>
        {/* Add a Google Maps link with the address */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            address.join(' ')
          )}`}
          target="_blank"
          rel="noreferrer"
        >
          <FaMap style={{float: 'left', marginRight: '1em'}} />
        </a>
        <div style={{float: 'left'}}>
          {/* Join the valid parts of the address together with line breaks */}
          {address
            .filter((line) => line.indexOf('undefined') === -1)
            .map((line, i) => (
              <React.Fragment key={i}>
                {line}
                <br />
              </React.Fragment>
            ))}
        </div>
      </React.Fragment>
    );
  } else {
    // There is no valid address, so just return an empty fragment
    return <></>;
  }
}

export default AddressBlock;
