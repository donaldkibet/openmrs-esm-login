import React from "react";
import Button from "carbon-components-react/es/components/Button";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Redirect } from "react-router-dom";
import styles from "./change-location.link.component.scss";
import Location20 from "@carbon/icons-react/es/location/20";
const openmrsSpaBase = window["getOpenmrsSpaBase"]();

interface ChangeLocationLinkProps {
  referer?: string;
  currentLocation: string;
}

const ChangeLocationLink: React.FC<ChangeLocationLinkProps> = ({
  referer,
  currentLocation,
}) => {
  const { t } = useTranslation();
  const [triggerLocationChange, setTriggerLocationChange] = React.useState(
    false
  );

  const changeLocation = () => {
    setTriggerLocationChange((prevState) => !prevState);
  };

  return (
    <BrowserRouter>
      {triggerLocationChange ? (
        <Redirect
          // @ts-ignore
          to={{
            pathname: `${openmrsSpaBase}login/location`,
            state: {
              referrer: referer.slice(
                referer.indexOf(openmrsSpaBase) + openmrsSpaBase.length - 1
              ),
            },
          }}
        />
      ) : (
        <div className={styles.changeLocationLinkContainer}>
          <Location20 />
          <div>
            {currentLocation}
            <Button
              className={styles.changeLocationLink}
              onClick={changeLocation}
            >
              {t("change", "Change")}
            </Button>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
};

export default ChangeLocationLink;
