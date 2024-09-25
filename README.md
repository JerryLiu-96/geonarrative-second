# Shoreline Geonarratives

## Introduction

This geonarrative includes an animation of the shoreline in the South Beach area roughly between Tokeland and Westport. The shoreline animation starts from 1860 when the shoreline was first surveyed, and ends at 2015, which is the latest shoreline survey we acquired from the Washington State Department of Ecology. We also developed an interactive visualization of sea level rise scenarios in the South Beach area in this geonarrative.

***
## Data Sources

We acquired historical shorelines data from two sources. The first is [NOAA's Shoreline Data Explorer](https://nsde.ngs.noaa.gov/), which is a publicly open source. We downloaded the historical shorelines in 1860 and 1911 from NOAA's Shoreline Data Explorer. The second is Washington State Department of Ecology. We acquired historical shorelines in the South Beach area from the Washington State Department of Ecology in the form of shapefile. Shorelines are not surveyed each year, the department provided us with digitized South Beach shorelines (roughly defined as Mean High Water) in 1942, 1954, 1967, 1974, 1986, 1995, 1997, 1999, 2001, 2006 and 2015.

To simulate sea level rise scenarios, we accessed raster DEM data from [NOAA's Sea level rise viewer](https://coast.noaa.gov/slr/). The DEM is referenced to NAVD88, and the horizontal resolution is 5 meters.

***
## Methods

This section describes the methods we used to create the shoreline animation and the sea level rise visualization.

***
### Historical Shoreline Animation

The shoreline is not surveyed regularly in the early years. Nevertheless, the shoreline may evlove rapidly between surveys. For instance, it changed significantly between 1860 and 1911, likely due to the construction of the jetty in 1902. If the animation only includes surveyed shorelines, it will appear uncontinuously to viewers. To smooth the animation, we interpolate the shorelines during the un-surveyed years, so that the shoreline in each year becomes a frame in the animation.

#### Step 1: Data Preparation

We converted the historical shorelines data from different sources into a common format, GeoJSON LineString Objects referenced to WGS84 (EPSG:4326). The 1860 shoreline is available in the format of shoreline manuscript (t-sheet). We georeferenced the t-sheet in ArcGIS Pro and exported it in the format of GeoJSON. The shorelines acquired from the Washington State Department of Ecology are in NAD 83 WA state plane S (meters) (EPSG:32149). We used python to convert it from EPSG:32149 to EPSG:4326 and export it in the format of GeoJSON LineStrings.

#### Step 2: Interpolation

We assume the shoreline evolves linearly between two surveyed shorelines. Since the shorelines are stored in the format of GeoJSON LineStrings, as a result it is actually a series of points. For each point on the earlier shoreline, we find the nearest point on the later shoreline. We then connect these two points and assume the shoreline point moved at a constant speed from the earlier point to the later point between the two surveys. So the number of interpolated points is determined by the number of years between the two surveys. For example, there are 51 years between 1860 and 1911, so 51 interpolated points exist between the two points. To get the shoreline of each year, we connect all points that belongs to the year we want.

We repeat this process for each pair of surveyed shorelines.

##### Step 3: Uncertainty

The interpolation method assumes the shoreline evolves linearly between two surveyed shorelines. This is a simplification of the actual process. The shoreline may evolve non-linearly, especially when there were significant human activities, such as the construction of the jetty in 1902. The interpolation method may not be accurate in these cases. And the uncertainties in the interpolated shorelines are unquantifiable. That is to say, the interpolated shorelines are for smoothing visualization purposes only.

To communicate the uncertainties qualitatively, in other words, to let viewers aware of the existence of uncertaintes, we colored the enclosed areas between two surveyed years. So the animation will have a visual effect of shoreline moving within the colored enclosed areas.

***
### Sea Level Rise Visualization

We used bathtub model to simulate the sea level rise scenarios. The raster DEM we downloaded  is referenced to NAVD88. For the sea level rise scenarios, we want to simulate the sea level rise relative to the Mean Higher High Water (MHHW) level. We converted the raster DEM from NAVD88 to MHHW by adding the MHHW level to the raster DEM. The MHHW level is 8.02 feet above NAVD88 in the South Beach area. We then added the sea level rise scenarios to the MHHW level to get the sea level rise scenarios relative to MHHW.

## Deliverables

This is a scroll-down geonarrative. The geonarrative follows a martini-glass structure: It first starts with a author-driven introduction and then "opens up" with interactive maps. The introduction section introduces hazard situations in the South Beach region. Then map viewers scroll down to interactive maps. The first map is the historical shoreline animation. Viewers can use the play/pause button to control the animation, they can also toggle on and off surveyed shorelines. The second map is the sea level rise scenarios. Map viewers are invited to choose a greenhouse gas emission scenario, they can also choose whether to include vertical land movement in the sea level rise. The graph shows the range of sea level rise by year until 2150 at an interval of 10 years. Viewers move the cursor on the graph, and the corresponding sea level rise scenrio will appear on the map.

![Shoreline Animation](img/historicalPage.png)
![Sea Level Rise Scenarios](img/slrPage.png)