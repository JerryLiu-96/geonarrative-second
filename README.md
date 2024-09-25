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

### Historical Shoreline Animation

The shoreline is not surveyed regularly in the early years. Nevertheless, the shoreline may evlove rapidly between surveys. For instance, it changed significantly between 1860 and 1911, likely due to the construction of the jetty in 1902. If the animation only includes surveyed shorelines, it will appear uncontinuously to viewers. To smooth the animation, we interpolate the shorelines during the un-surveyed years, so that the shoreline in each year becomes a frame in the animation.

#### Step 1: Data Preparation

We converted the historical shorelines data from different sources into a common format, GeoJSON LineString Objects referenced to WGS84 (EPSG:4326). The 1860 shoreline is available in the format of shoreline manuscript (t-sheet). We georeferenced the t-sheet in ArcGIS Pro and exported it in the format of GeoJSON. The shorelines acquired from the Washington State Department of Ecology are in NAD 83 WA state plane S (meters) (EPSG:32149). We used python to convert it from EPSG:32149 to EPSG:4326 and export it in the format of GeoJSON LineStrings.

#### Step 2: Interpolation

We assume the shoreline evolves linearly between two surveyed shorelines. Since the shorelines are stored in the format of GeoJSON LineStrings, as a result it is actually a series of points. For each point on the earlier shoreline, we find the nearest point on the later shoreline. We then connect these two points and assume the shoreline point moved at a constant speed from the earlier point to the later point between the two surveys. So the number of interpolated points is determined by the number of years between the two surveys. For example, there are 51 years between 1860 and 1911, so 51 interpolated points exist between the two points. To get the shoreline of each year, we connect all points that belongs to the year we want.

We repeat this process for each pair of surveyed shorelines.

##### Step 3: Uncertainty Visualization

The interpolation method assumes the shoreline evolves linearly between two surveyed shorelines. This is a simplification of the actual process. The shoreline may evolve non-linearly, especially when there were significant human activities, such as the construction of the jetty in 1902. The interpolation method may not be accurate in these cases. And the uncertainties in the interpolated shorelines are unquantifiable. That is to say, the interpolated shorelines are for smoothing visualization purposes only.

To communicate the uncertainties qualitatively, in other words, to let viewers aware of the existence of uncertaintes, we colored the enclosed areas between two surveyed years. So the animation will have a visual effect of shoreline moving within the colored enclosed areas.

### Sea Level Rise Visualization

Put simply, we first converted the raster DEM from NAVD88 to MHHW because we visualize inundation under MHHW, then we added the sea level rise scenarios to the MHHW level to get the sea level rise scenarios relative to MHHW. We then interpreted the amount of sea level rise and visualized the range of sea level rise.

### Step 1: DEM Data Preparation

We used bathtub model to simulate the sea level rise scenarios. The raster DEM we downloaded  from [NOAA's Sea level rise viewer](https://coast.noaa.gov/slr/) is referenced to NAVD88. For the sea level rise scenarios, we want to simulate the sea level rise relative to the Mean Higher High Water (MHHW) level. For example, the sea level rise scenario of 2 feet shows the inundation map of a 2 feet increase in MHHW. The sea level rise scenarios in [NOAA's Sea level rise viewer](https://coast.noaa.gov/slr/) is also referenced to MHHW. We converted the raster DEM from NAVD88 to MHHW by subtracting the difference between MHHW and NAVD88 at Westport to the raster DEM. The MHHW level is 8.02 feet above NAVD88 at Westport, so we subtract 8.02 feet, pixels with negative values and connected to the sea are considered inundated. We then added the sea level rise scenarios to the MHHW level to get the sea level rise scenarios relative to MHHW.

### Step 2: Amount of Sea Level Rise Intepretation

Sea level rise projections are given in the form of a range for a defined probability. Our sea level rise scenarios cover the range of 90% probability. For example, the sea level rise projection is 1.5 to 4.5 feet means the probability of less than 1.5 feet sea level rise is 5% and the probability of more than 4.5 feet sea level rise is also 5%. In other words, the actually sea level rise has a chance of 90% to fall between 1.5 feet and 4.5 feet. The lower bound is the minimum sea level rise projection, and the upper bound is the maximum sea level rise projection.

We assume the absolute sea level rise and land vertical movement are independent and follow normal distribution. Under this assumption, we can add the lower bound of sea level rise and the lower bound of land movement to get the new lower bound of relative sea level rise. Apparently the same for upper bound. For example, if the absolute sea level rise has a chance of 90% to fall between 1.5 feet and 4.5 feet, and the land subsidiary has a chance of 90% to fall between 0.5 feet and 2 feet, then the relative sea level rise has a chance of 90% to fall between 2 feet (= 1.5 + 0.5) and 6.5 feet (= 4.5 + 2).

### Step 3: Sea Level Rise Visualization

To visualize the range of sea level rise, we colored the inundated areas in two colors. The deeper blue indicates the inundated area when the sea level rises by the lower-bound amount, and the lighter blue indicates the inundated area when the sea level rises by the upper-bound amount.

***
## Deliverables

This is a scroll-down geonarrative. The geonarrative follows a martini-glass structure: It first starts with a author-driven introduction and then "opens up" with interactive maps. The introduction section introduces hazard situations in the South Beach region. Then map viewers scroll down to interactive maps.

The first interactive map is the historical shoreline animation. Viewers can use the play/pause button to control the animation, they can also toggle on and off surveyed shorelines.

The second interactive map is the sea level rise scenarios. Map viewers are invited to choose a greenhouse gas emission scenario, they can also choose whether to include vertical land movement in the sea level rise. After viewers make their selections, the graph will show the range of sea level rise by year until 2150 at an interval of 10 years. Viewers move the cursor on the graph, and they will see the lower bound and upper bound of the sea level rise projection in the year where the cursor appears. The corresponding sea level rise map will appear on the map. For example, if the lower bound is 0.1 feet and the upper bound is 3 feet, the deeper blue indicates inunadted area when the sea level rises by lower-bound amount (0.1 feet), and the lighter blue indicates inunadted area when the sea level rises by upper-bound amount (3 feet).

![Shoreline Animation](img/historicalPage.png)
![Sea Level Rise Scenarios](img/slrPage.png)