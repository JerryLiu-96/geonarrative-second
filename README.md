# Shoreline Geonarratives

## Introduction

This geonarrative has two sections. The first section is an introduction part of hazard basic knowledge in the South Beach area. The second section is a series of GIS-based interactive maps developed in Mapbox GL JS. The first interactive GIS-based map invites map readers to pinpoint places of their interests on the map. The second map is an animation of the historical shoreline in the South Beach area, roughly between Tokeland and Westport. The shoreline animation starts from 1860 when the shoreline was first surveyed, and ends in 2015, which is the latest shoreline survey we acquired from the Washington State Department of Ecology. Last, we also developed an interactive visualization of sea level rise scenarios in the South Beach area in this geonarrative.

***
## Data Sources

We acquired historical shoreline data from two sources. The first is [NOAA's Shoreline Data Explorer](https://nsde.ngs.noaa.gov/), which is a publicly open source. We downloaded the historical shorelines in 1860 and 1911 from NOAA's Shoreline Data Explorer. The second is the Washington State Department of Ecology. We acquired historical shorelines in the South Beach area from the Washington State Department of Ecology in the form of a shapefile. Shorelines are not surveyed each year, the department provided us with digitized South Beach shorelines (roughly defined as Mean High Water) in 1942, 1954, 1967, 1974, 1986, 1995, 1997, 1999, 2001, 2006, and 2015.

To simulate sea level rise scenarios, we accessed raster DEM data from [NOAA's Sea level rise viewer](https://coast.noaa.gov/slr/). The DEM is referenced to NAVD88, and the horizontal resolution is 5 meters.

***
## Methods

This section describes the methods we used to: 1. create the historical shoreline animation and 2. the sea level rise visualization.

### Historical Shoreline Animation

The shoreline is not surveyed regularly in the early years. Nevertheless, the shoreline may evolve rapidly between surveys. For instance, it changed significantly between 1860 and 1911, likely due to the construction of the jetty in 1902. If the animation only includes surveyed shorelines, it will not appear continuously to viewers. To smooth the animation, we interpolate the shorelines during the un-surveyed years, so that the shoreline in each year becomes a frame in the animation.

#### Step 1: Data Preparation

We converted the historical shoreline data from different sources into a common format, GeoJSON LineString Objects referenced to WGS84 (EPSG:4326). The 1860 shoreline is available in the format of a shoreline manuscript (t-sheet). We georeferenced the t-sheet in ArcGIS Pro and exported it in the format of GeoJSON. The shorelines acquired from the Washington State Department of Ecology are in NAD 83 WA state plane S (meters) (EPSG:32149). We used Python to convert it from EPSG:32149 to EPSG:4326 and export it in the format of GeoJSON LineStrings.

#### Step 2: Interpolation

We assume the shoreline evolves linearly between two surveyed shorelines. Since the shorelines are stored in the format of GeoJSON LineStrings. As a result, it is actually a series of points. For each point on the earlier shoreline, we find the nearest point on the later shoreline. We then connect these two points and assume the shoreline point moved at a constant speed from the earlier point to the later point between the two surveys. So the number of interpolated points is determined by the number of years between the two surveys. For example, there are 51 years between 1860 and 1911, so 51 interpolated points exist between the two points. To get the shoreline of each year, we connect all points that belong to the year we want.

We repeat this process for each pair of surveyed shorelines.

##### Step 3: Uncertainty Visualization

The interpolation method assumes the shoreline moves at a constant speed between two surveyed shorelines. This is a simplification of the actual process because there is no probability distribution for the shoreline change process. The shoreline may evolve non-linearly, especially when there were significant human activities, such as the construction of the jetty in 1902. And the uncertainties in the interpolated shorelines are unquantifiable. That is to say, the interpolated shorelines are for smoothing visualization purposes only, we do not suggest that the shoreline is more likely at the interpolated line.

To communicate the uncertainties, in other words, to make viewers aware of the existence of uncertainties, we colored the enclosed area between two surveyed years. This uncertainty visualization method is called ambiguation. The ambiguation colors the enclosed area with a single color value, not a color gradient because there is no probability distribution for the shoreline position, and this type of uncertainty is called bounded uncertainty: the probability distribution is unknown, the actual value lies somewhere between two bounds (immediate preceding and following surveys). So the animation will have a visual effect of shoreline moving within the colored enclosed area.

### Sea Level Rise Visualization

Put simply, we first converted the raster DEM from NAVD88 to MHHW because we visualize inundation under MHHW, then we added the sea level rise scenarios to the MHHW level to get the sea level rise scenarios relative to MHHW. We then interpreted the amount of sea level rise and visualized the range of sea level rise.

#### Step 1: DEM Data Preparation

We used a bathtub model to simulate the sea level rise scenarios. The raster DEM we downloaded  from [NOAA's Sea Level Rise viewer](https://coast.noaa.gov/slr/) is referenced to NAVD88. For the sea level rise scenarios, we want to simulate the sea level rise relative to the Mean Higher High Water (MHHW) level. For example, the sea level rise scenario of 2 feet shows the inundation map of a 2 feet increase in MHHW. The sea level rise scenarios in [NOAA's Sea level rise viewer](https://coast.noaa.gov/slr/) is also referenced to MHHW. We converted the raster DEM from NAVD88 to MHHW by subtracting the difference between MHHW and NAVD88 at Westport to the raster DEM. The MHHW level is 8.02 feet above NAVD88 at Westport, so we subtract 8.02 feet, pixels with negative values and connected to the sea are considered inundated. We then added the sea level rise scenarios to the MHHW level to get the sea level rise scenarios relative to MHHW.

#### Step 2: Amount of Sea Level Rise Interpretation

Sea level rise projections are given in the form of a range for a defined probability. Our sea level rise scenarios cover the range of 90% probability. For example, the sea level rise projection is 1.5 to 4.5 feet means the probability of less than 1.5 feet sea level rise is 5% and the probability of more than 4.5 feet sea level rise is also 5%. In other words, the actual sea level rise has a chance of 90% to fall between 1.5 feet and 4.5 feet. The lower bound is the minimum sea level rise projection, and the upper bound is the maximum sea level rise projection.

We assume the absolute sea level rise and land vertical movement are independent and follow normal distribution. Under this assumption, we can add the lower bound of sea level rise and the lower bound of land movement to get the new lower bound of relative sea level rise. Apparently the same for the upper bound. For example, if the absolute sea level rise has a chance of 90% to fall between 1.5 feet and 4.5 feet, and the land subsidiary has a chance of 90% to fall between 0.5 feet and 2 feet, then the relative sea level rise has a chance of 90% to fall between 2 feet (= 1.5 + 0.5) and 6.5 feet (= 4.5 + 2).

#### Step 3: Sea Level Rise Visualization

To visualize the range of sea level rise, we colored the inundated areas in two colors. The deeper blue indicates the inundated area when the sea level rises by the lower bound amount, and the lighter blue indicates the inundated area when the sea level rises by the upper bound amount.

***
## Deliverables

This is a scroll-down geonarrative. The geonarrative storyline resembles a "martini glass" structure: It starts with an author-driven introduction of hazard situations in the South Beach region, where viewers are expected to follow the sequence controlled by the creator, and then "opens up" with interactive GIS-based maps where viewers are free to contribute their place-based stories and explore hazard scenarios.

The interactive GIS-based maps, developed using Mapbox GL JS, consist of three components. The first is a pinpoint map, allowing viewers to click and mark locations of interest, which remain visible on the map once added. In the second component, viewers can explore the historical significance of their selected locations, while the third component reveals the conditions under which these locations might be inundated by rising sea levels.

The second part of the interactive map is the historical shoreline animation. Viewers can use the play/pause button to control the animation, they can also toggle on and off surveyed shorelines.

The third component of the interactive map focuses on sea level rise scenarios. Viewers are invited to select a greenhouse gas emission scenario and choose whether to account for vertical land movement in the projections. Based on these inputs, a graph displays the projected range of sea level rise by decade through 2150. By moving the cursor along the graph, viewers can see the lower and upper bounds of sea level rise for any selected year. This approach explicitly communicates temporal uncertainty. Simultaneously, the map visualizes spatial uncertainty: for instance, if the lower bound of sea level rise is 0.1 feet and the upper bound is 3 feet, areas inundated at the lower bound appear in deeper blue, while those inundated at the upper bound are shown in lighter blue.

![Shoreline Animation](img/historicalPage.png)
![Sea Level Rise Scenarios](img/slrPage.png)