import React, { useCallback, useEffect, useState } from "react";
import { Map } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import { ScatterplotLayer } from "@deck.gl/layers";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/generated/db";
import { PickingInfo } from "@deck.gl/core";
import { MjolnirEvent } from "mjolnir.js";
// import { useNavigate, useLocation } from "react-router-dom";
import { useRouter } from "next/router";
import { FeatureCollection, Geometry } from "geojson";

const supabaseUrl = "https://dimmbajebuxcomgzbzrj.supabase.co"; // Your Supabase Project URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Your Supabase Key

// Create a single supabase client for interacting with your database
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

interface Geometry2 {
  type: "MultiPolygon";
  coordinates: number[][][][]; // Assuming coordinates are a four-dimensional array for MultiPolygons
}

interface Properties {
  shape_geojson: Geometry2; // Assuming shape_geojson follows the same structure as Geometry
  blklot: string;
  zoning_code: string;
}

interface Feature {
  geometry: Geometry2;
  properties: Properties;
  type: "Feature";
}

type NullableFeature = Feature | null;

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

  type ParcelRow = Database["public"]["Tables"]["parcels"]["Row"] | null;
  const [data, setData] = useState<ParcelRow[]>();
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10000;
  const [selectedFeature, setSelectedFeature] = useState<NullableFeature>(null);

  useEffect(() => {
    const fetchData = async () => {
      const initialLimit = 1000; // Fetch the first 1000 entries instantly
      const batchLimit = 10000; // Subsequent fetches will be in batches of 20,000
      // const totalRows = 156000; // Total rows to fetch
      const totalRows = 10000; // Total rows to fetch
      let offset = initialLimit; // Start offset for batched data after initial fetch

      // Fetch initial data
      const { data: initialData, error: initialError } = await supabase
        .from("parcels")
        .select("*")
        .range(0, initialLimit - 1);

      if (initialError) {
        console.error(initialError);
      } else if (initialData) {
        // Check if initialData is not null or undefined
        setData(initialData); // Set initial data instantly
      }

      // Fetch remaining data in batches
      while (offset < totalRows) {
        const { data: newData, error } = await supabase
          .from("parcels")
          .select("shape_geojson, blklot, zoning_code")
          .range(offset, offset + batchLimit - 1);

        if (error) {
          console.error(error);
          break;
        } else if (newData) {
          // Check if newData is not null or undefined
          //@ts-ignore ok
          setData((prevData) => [...(prevData || []), ...newData]);
        }
        await new Promise((res) => setTimeout(res, 1000)); // Delay to prevent rate limiting
        offset += batchLimit;
      }
      // console.log(offset, "offset");
    };

    fetchData();
  }, []);

  // console.log(data, "data");

  type ParcelProperties = Database["public"]["Tables"]["parcels"]["Row"];

  type GeoJson = {
    type: "FeatureCollection";
    features: {
      type: "Feature";
      properties: ParcelRow;
      geometry: any | undefined; // Assuming `shape_geojson` is of type `Geometry` or `null`
    }[];
  };

  // Initialize geoJsonData with an empty FeatureCollection
  let geoJsonData: GeoJson = {
    type: "FeatureCollection",
    features: [],
  };

  if (data) {
    geoJsonData = {
      type: "FeatureCollection",
      features: data.map((item) => ({
        type: "Feature",
        properties: item, // Assuming item contains properties suitable for GeoJSON
        geometry: item?.shape_geojson || null,
      })),
    };
  }

  // Callback to populate the default tooltip with content
  const getTooltip = useCallback(
    ({ object }: PickingInfo<GeoJson["features"][0]>) => {
      if (!object || !object.properties) return null; // Ensure null is returned when there's no object
      // console.log(object, "whats the object here");
      return (
        object && {
          html: `<h2>Message:</h2> <div>Block Lot: ${object.properties.blklot} <br/> Zoning code: ${object.properties.zoning_code}</div>`,
          style: {
            backgroundColor: "#000",
            fontSize: "0.8em",
          },
        }
      );
    },
    []
  );

  console.log(geoJsonData, "geoJsonData");

  const layer = new GeoJsonLayer<ParcelRow>({
    id: "geojson-layer",
    data: geoJsonData,
    pickable: true,
    stroked: false,
    filled: true,
    extruded: true,
    lineWidthScale: 20,
    lineWidthMinPixels: 2,
    getFillColor: (feature: { properties: ParcelRow }) =>
      feature.properties?.blklot === selectedFeature?.properties?.blklot
        ? [0, 255, 0]
        : [160, 160, 180, 200],
    // getLineColor: [0, 0, 0, 255],
    getLineColor: (feature) => {
      console.log(feature, "featureeee");
      return [0, 255, 0];
      // feature === selectedFeature ? [0, 255, 0] : [0, 0, 0, 255]
    },
    getRadius: 100,
    getLineWidth: 1,
    getElevation: (feature: { properties: ParcelRow }) =>
      feature.properties?.blklot === selectedFeature?.properties?.blklot
        ? 40
        : 30,
    onClick: ({ object }) => {
      console.log(object, "clicked!!");
      console.log(selectedFeature, "selectedFeature");
      setSelectedFeature(object);
    },
    updateTriggers: {
      getFillColor: [selectedFeature],
    },
  });

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
      layers={[layer]}
      getTooltip={getTooltip}
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
