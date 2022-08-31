import { ReactiveComponent } from "@appbaseio/reactivesearch";
import { useParams } from "react-router-dom";

import FilerContributions from './FilerContributions';
import FilerData from './FilerData';

function Filer() {
  let {filerID} = useParams();

  return <div style={{maxWidth: '800px', margin: '0 auto'}}>
    <ReactiveComponent
      componentId="filerData"
      defaultQuery={() => ({
        fields: [
          "CAND_COMM_NAME",
          "FILER_TYPE_DESC",
          "STATUS",
          "COUNTY_DESC",
          "TREASURER_FIRST_NAME",
          "TREASURER_LAST_NAME",
          "TREASURER_MIDDLE_NAME",
          "ADDRESS",
          "CITY",
          "STATE",
          "ZIPCODE"
        ],
        _source: false,
        query: {
          match: {
            FILER_ID: filerID
          }
        },
        size: 1
      })}
      render={({error, loading, data}) => {
        if (loading) {
          return <div>Loading</div>;
        } else if (error || data.length !== 1) {
          return <div>Error</div>;
        } else {
          const fields = data[0].fields;
          return <FilerData data={fields} />
        }
      }}
    />

    <h3>Contributions</h3>
    <FilerContributions filerID={filerID} />
  </div>;
}

export default Filer;
