import React, { useCallback, useEffect, useState } from "react";
import { Map } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/generated/db";
import { PickingInfo } from "@deck.gl/core";
import { MjolnirEvent } from "mjolnir.js";
// import { useNavigate, useLocation } from "react-router-dom";
import { useRouter } from "next/router";

const DarkModeMapComponent = () => {
  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8,
  });
  const router = useRouter();

  const INITIAL_VIEW_STATE = {
    latitude: 37.7749,
    longitude: -122.4194,
    zoom: 11,
    // minZoom: 14,
    // maxZoom: 16.5,
    bearing: 0,
    pitch: 45,
  };

  // const onClickHandler = useCallback(
  //   (info: PickingInfo<Datatype2>, event: MjolnirEvent) => {
  //     if (info.object) {
  //       setSelectedDataPoint(info.object);
  //       const queryParams = new URLSearchParams(
  //         router.query as Record<string, string>
  //       );
  //       queryParams.set("selected", info.object.id.toString());
  //       router.replace(
  //         {
  //           pathname: router.pathname,
  //           query: queryParams.toString(),
  //         },
  //         undefined,
  //         { shallow: true }
  //       );
  //     } else {
  //       setSelectedDataPoint(null);
  //     }
  //   },
  //   [router]
  // );

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      style={{
        height: "100vh",
        width: "100vw",
        position: "fixed",
        overflow: "hidden",
      }}
      controller={{ touchRotate: true, inertia: 250 }}
      // layers={[scatterplotLayer]}
      // onClick={onClickHandler}
    >
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_REACT_APP_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/dark-v10"
      />
    </DeckGL>
  );
};

export default DarkModeMapComponent;
