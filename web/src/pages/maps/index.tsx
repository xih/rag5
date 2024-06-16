import React, { useCallback, useEffect, useState } from "react";
import { Map } from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/generated/db";
import { PickingInfo } from "@deck.gl/core";
import { MjolnirEvent } from "mjolnir.js";
import { SheetDemo } from "./Sheet";
// import { useNavigate, useLocation } from "react-router-dom";
import { useRouter } from "next/router";

const supabaseUrl = "https://dimmbajebuxcomgzbzrj.supabase.co"; // Your Supabase Project URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Your Supabase Key

// todo - click on dot and get shadcn sheet displayed
// [6-13-2024] -
// 1. make it so that the sheet doesn't open up twice when the dot is selected
// 2. display the data from the dot in the sheet

// Create a single supabase client for interacting with your database
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// [6/9/2024] - got light map working
// todo: get geojson of sf parcel maps working

type ParcelRow =
  | Database["public"]["Tables"]["postgrespropertydocuments3"]["Row"]
  | null;

const INITIAL_VIEW_STATE = {
  latitude: 37.7749,
  longitude: -122.4194,
  zoom: 11,
  // minZoom: 14,
  // maxZoom: 16.5,
  bearing: 0,
  pitch: 45,
};

const PAGE_SIZE = 10000;

const usePaginatedData = () => {
  const [data, setData] = useState<ParcelRow[]>();
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: newData, error } = await supabase
        .from("postgrespropertydocuments4")
        .select()
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) {
        console.error(error);
      } else {
        setData((prevData) => [...(prevData || []), ...newData]);
      }
    };

    fetchData();
  }, [page]);

  return { data, setPage };
};

type DataType = {
  from: [longitude: number, latitude: number];
  to: [longitude: number, latitude: number];
};

export type Datatype2 = {
  longitude: number;
  latitude: number;
  message: string;
  grantee: string;
  grantor: string;
  apn: string;
  block: string;
  booknumber: string;
  booktype: string;
  createdat: string;
  documentdate: string;
  documentid: string;
  filingcode: string;
  id: number;
  lot: string;
  nameinternalid: string;
  names: string;
  numberofpages: number;
  primarydocnumber: string;
  secondarydocnumber: string;
  totalnamescount: number;
  updatedat: string;
};

const defaultPropertyData: Datatype2 = {
  longitude: 0,
  latitude: 0,
  message: "",
  grantee: "",
  grantor: "",
  apn: "",
  block: "",
  booknumber: "",
  booktype: "",
  createdat: "",
  documentdate: "",
  documentid: "",
  filingcode: "",
  id: 0,
  lot: "",
  nameinternalid: "",
  names: "",
  numberofpages: 0,
  primarydocnumber: "",
  secondarydocnumber: "",
  totalnamescount: 0,
  updatedat: "",
};

const MapComponent = () => {
  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8,
  });
  const router = useRouter();

  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] =
    useState<Datatype2 | null>();

  const useIncrementalData = () => {
    const [data, setData] = useState<ParcelRow[]>([]);
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const fetchData = async () => {
      let offset = 0;
      const limit = 20000;
      while (offset < 300000) {
        const { data: newData, error } = await supabase
          .from("postgrespropertydocuments4")
          .select("*")
          .range(offset, offset + limit - 1);
        if (error) console.error(error);
        else
          setData((prev) => {
            const updatedData = [...prev, ...newData];
            return updatedData;
          });
        await delay(100); // Wait for 1 second before fetching next batch
        offset += limit;
      }
    };

    useEffect(() => {
      fetchData();
    }, []);

    return { data };
  };

  // Callback to populate the default tooltip with content
  const getTooltip = useCallback(({ object }: PickingInfo<Datatype2>) => {
    if (object) {
      return {
        text: `grantee: ${object.grantee}
        grantor: ${object.grantor}`,
        style: {},
      };
    }
    return null; // or return { text: '', style: {} } to ensure a TooltipContent type is always returned
  }, []);

  const [fetching, setFetching] = useState(false);
  const [offset, setOffset] = useState(0);
  const batchSize = 1000;
  const { data, setPage } = usePaginatedData();

  const { data: data2 } = useIncrementalData();

  const onClick = useCallback((info: PickingInfo, event: MjolnirEvent) => {},
  []);

  const scatterplotLayer = new ScatterplotLayer({
    id: "scatterplot-layer",
    data: data2,
    getPosition: (d: Datatype2) => [d.longitude, d.latitude],
    getRadius: (d) => 15,
    getColor: (d) => [255, 140, 0],
    pickable: true,
    highlightColor: [0, 0, 128, 128],
    autoHighlight: true,
    // onHover: (info: PickingInfo<DataType>, event: MjolnirEvent) =>
    //   console.log("Hovered:", info, event),
    // onClick: onClick2,
  });

  // console.log(scatterplotLayer, "scatterplotLayer");

  const onClickBesidesScatterPlotLayer = useCallback(
    (info: PickingInfo<Datatype2>, event: MjolnirEvent) => {
      if (info.object) {
        setSelectedDataPoint(info.object);
        const queryParams = new URLSearchParams(
          router.query as Record<string, string>
        );
        queryParams.set("selected", info.object.id.toString());
        router.replace(
          {
            pathname: router.pathname,
            query: queryParams.toString(),
          },
          undefined,
          { shallow: true }
        );

        // Update localStorage cache
        const dataPointsCache = JSON.parse(
          localStorage.getItem("dataPointsCache") || "[]"
        );
        dataPointsCache.push(info.object);
        if (dataPointsCache.length > 10) {
          dataPointsCache.shift(); // Remove the oldest entry if exceeding 10
        }
        localStorage.setItem(
          "dataPointsCache",
          JSON.stringify(dataPointsCache)
        );
        localStorage.setItem("selectedDataPoint", JSON.stringify(info.object));
      } else {
        setSelectedDataPoint(null);
        localStorage.removeItem("selectedDataPoint");
        const queryParams = new URLSearchParams(
          router.query as Record<string, string>
        );
        queryParams.delete("selected");
        router.replace(
          {
            pathname: router.pathname,
            query: queryParams.toString(),
          },
          undefined,
          { shallow: true }
        );
      }
    },
    [router]
  );

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
      layers={[scatterplotLayer]}
      getTooltip={getTooltip}
      onClick={onClickBesidesScatterPlotLayer}
    >
      <SheetDemo
        isSheetOpen={!!selectedDataPoint}
        propertyData={selectedDataPoint || defaultPropertyData}
      />
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_REACT_APP_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
      />
    </DeckGL>
  );
};

export default MapComponent;
