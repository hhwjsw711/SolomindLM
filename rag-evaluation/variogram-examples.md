# Variograms

2026 January 26

# Function for variogram as defined in
# Bisgaard and Kulahci (2011). Time Series Analysis and Forecasting by Example, Wiley
variogram = function(y, lagmax=10, iprint=F)
{ G = rep(1,lagmax)
n = length(y)
if(lagmax>n) { lagmax = n-2 }
y1 = y[-1]; y2 = y[-n]
d1 = y1-y2; denom = var(d1)
for(k in 2:lagmax)
{ y1 = y[(k+1):n]; y2 = y[1:(n-k)]
dk = y1-y2
numer = var(dk)
G[k] = numer/denom
}
# H is the variogram assuming a stationary time series
H = rep(1,lagmax)
ac = c(acf(y,plot=F,lag.max=lagmax)$acf)
H = (1-ac[-1])/(1-ac[2])
if(iprint)
{ print(cbind(G,H))
mx = max(cbind(G,H))
matplot(1:lagmax,cbind(G,H),ylim=c(0,mx),ylab="variogram", xlab="lag")
abline(h=1)
}
list(G=G, H=H)
}

## Use variogram to assess stationarity

⬇
par(mfrow=c(2,2))

v = read.csv("vanc-prec-temp.csv",header=T)
# length is 86*12 = 1032
precip = matrix(v$totprecip,nrow=12)
# January in row 1 etc.
precip_july = precip[7,]
plot.ts(precip_july)
vgram_precip = variogram(precip_july,lagmax=10, iprint=T)
#> G H
#> [1,] 1.0000000 1.0000000
#> [2,] 0.8638439 0.8564867
#> [3,] 0.9964949 0.9875582
#> [4,] 1.1269349 1.1071073

```txt
$\# &gt;$  [5,] 1.1504192 1.1191376
$\# &gt;$  [6,] 0.9336603 0.9123764
$\# &gt;$  [7,] 1.0286668 1.0059631
$\# &gt;$  [8,] 0.8050991 0.7914523
$\# &gt;$  [9,] 0.9344919 0.9015633
$\# &gt;$  [10,] 1.1100667 1.0501455
csgb_df  $=$  read.csv("CSGBCBRL36to78.csv", skip=3, header=T)
csret  $=$  csgb_df\\(CS # returns of corporate stocks
plot.ts(csret)
vgram_csret  $=$  variogram(csret,lagmax=10, iprint=T)
$\# &gt;$  G H
$\# &gt;$  [1,] 1.000000 1.000000
$\# &gt;$  [2,] 1.226281 1.219346
$\# &gt;$  [3,] 1.218357 1.207587
$\# &gt;$  [4,] 1.150144 1.138117
$\# &gt;$  [5,] 1.120216 1.103011
$\# &gt;$  [6,] 1.221031 1.205256
$\# &gt;$  [7,] 1.202788 1.187029
$\# &gt;$  [8,] 1.233454 1.238383
$\# &gt;$  [9,] 1.063980 1.090262
$\# &gt;$  [10,] 1.005067 1.083268
```

gdp_df = read.csv("gdp-unemploy-FRED.csv", header=T, nrow=236)
# Restrict to start in 1987, omit 104 rows
gdp_df = gdp_df[-(1:104),]
unempl = gdp_df$unempl
plot.ts(unempl)
vgram_unempl = variogram(unempl,lagmax=10, iprint=T)
#> G H
#> [1,] 1.000000 1.000000
#> [2,] 2.935492 2.480395
#> [3,] 5.422040 4.239706
#> [4,] 8.160846 6.059132
#> [5,] 10.896604 7.883518
#> [6,] 13.879309 9.758698
#> [7,] 17.081302 11.733096
#> [8,] 20.306217 13.694625
#> [9,] 23.182695 15.380193
#> [10,] 25.951029 16.967987

diflnunempl = gdp_df$diflnunempl
plot.ts(diflnunempl)
vgram_diflnunempl = variogram(diflnunempl,lagmax=10, iprint=T)
#> G H
#> [1,] 1.000000 1.000000
#> [2,] 1.322259 1.326465
#> [3,] 1.579456 1.585673
#> [4,] 1.861124 1.865193
#> [5,] 1.630347 1.643093
#> [6,] 1.790377 1.787611
#> [7,] 1.910966 1.890335
#> [8,] 2.157012 2.118032
#> [9,] 2.066094 2.018581
#> [10,] 2.040518 1.992095

cpi_df = read.csv("CANCPALTT01IXOBSAM.csv",header=T)
cpi = ts(cpi_df$CANCPALTT01IXOBSAM,start=c(1992,1), end=c(2025,3),frequency=12)
plot.ts(cpi)
vgram_cpi = variogram(cpi,lagmax=10, iprint=T)
#&gt; G H
#&gt; [1,] 1.000000 1.000000
#&gt; [2,] 2.557518 2.014571
#&gt; [3,] 4.256778 3.004536
#&gt; [4,] 6.211439 3.996564
#&gt; [5,] 8.504597 4.989812
#&gt; [6,] 11.061465 5.983290
#&gt; [7,] 13.840331 6.977326
#&gt; [8,] 16.895072 7.981872
#&gt; [9,] 20.081904 8.992363
#&gt; [10,] 23.463736 9.998386

difcpi = diff(cpi)
plot.ts(difcpi)
vgram_difcpi = variogram(difcpi,lagmax=10, iprint=T)
#&gt; G H
#&gt; [1,] 1.000000 1.000000
#&gt; [2,] 1.277210 1.284509

```txt
$\# &gt;$  [3,] 1.205579 1.210404
$\# &gt;$  [4,] 1.152066 1.154455
$\# &gt;$  [5,] 1.207875 1.206907
$\# &gt;$  [6,] 1.235421 1.232344
$\# &gt;$  [7,] 1.214514 1.209460
$\# &gt;$  [8,] 1.313883 1.304261
$\# &gt;$  [9,] 1.260691 1.250492
$\# &gt;$  [10,] 1.123603 1.113781
```
difcpi = diff(cpi)
plot.ts(difcpi)
vgram_difcpi = variogram(difcpi,lagmax=10, iprint=T)
#&gt; G H
#&gt; [1,] 1.000000 1.000000
#&gt; [2,] 1.277210 1.284509

```txt
$\# &gt;$  [3,] 1.205579 1.210404
$\# &gt;$  [4,] 1.152066 1.154455
$\# &gt;$  [5,] 1.207875 1.206907
$\# &gt;$  [6,] 1.235421 1.232344
$\# &gt;$  [7,] 1.214514 1.209460
$\# &gt;$  [8,] 1.313883 1.304261
$\# &gt;$  [9,] 1.260691 1.250492
$\# &gt;$  [10,] 1.123603 1.113781
```

```txt
Monthly mean relative sunspot numbers from 1749 to 1983
data(sunspots)
sunspot100mon = sunspots[1:100]
plot.ts(sunspot100mon)
vgram_sunspot100 = variogram(sunspot100mon,lagmax=10, iprint=T)
#&gt; G H
#&gt; [1,] 1.000000 1.000000
#&gt; [2,] 1.272115 1.281105
#&gt; [3,] 1.418206 1.456462
#&gt; [4,] 1.333068 1.396809
#&gt; [5,] 1.566404 1.718408
#&gt; [6,] 1.701202 1.926984
#&gt; [7,] 1.712478 2.069780

```txt
$\# &gt;$  [8,] 1.733790 2.141263
$\# &gt;$  [9,] 1.802670 2.296297
$\# &gt;$  [10,] 1.924744 2.508661
sunspot1000mon  $=$  sunspots[1:1000]
plot.ts(sunspot1000mon)
vgram_sunspot1000  $=$  variogram(sunspot1000mon,lagmax=10，iprint=T)
$\# &gt;$  G H
$\# &gt;$  [1,] 1.000000 1.000000
$\# &gt;$  [2,] 1.333296 1.333102
$\# &gt;$  [3,] 1.469131 1.470090
$\# &gt;$  [4,] 1.553320 1.553561
$\# &gt;$  [5,] 1.709149 1.714057
$\# &gt;$  [6,] 1.877353 1.885242
$\# &gt;$  [7,] 2.127732 2.141453
$\# &gt;$  [8,] 2.230588 2.243308
$\# &gt;$  [9,] 2.288136 2.302320
$\# &gt;$  [10,] 2.465698 2.479425
```

```txt
set.seed(1234)
ar1negphi = arima.sim(n=200, list(ar=c(-0.5)), sd=1)
plot(ar1negphi, main="AR(1) coeff -0.5")
vgram_ar1neg = variogram(ar1negphi, lagmax=10, iprint=T)

```txt
#&gt; G H
#&gt; [1,] 1.0000000 1.0000000
#&gt; [2,] 0.5646692 0.5638677
#&gt; [3,] 0.8159956 0.8097691
#&gt; [4,] 0.7326234 0.7271270
#&gt; [5,] 0.6773252 0.6713390
#&gt; [6,] 0.8140377 0.8014078
#&gt; [7,] 0.6033357 0.5939428
#&gt; [8,] 0.8050445 0.7862718
#&gt; [9,] 0.6705801 0.6537392
#&gt; [10,] 0.8095885 0.7981637
```

```txt
set.seed(1234)
ar1posphi = arima.sim(n=200, list(ar=c(0.6)), sd=1)
plot(ar1posphi, main="AR(1) coeff 0.6")
vgram_ar1pos = variogram(ar1posphi, lagmax=10, iprint=T)
#&gt; G H
#&gt; [1,] 1.000000 1.000000
#&gt; [2,] 1.816059 1.797360
#&gt; [3,] 2.397055 2.356809
#&gt; [4,] 2.647696 2.589534
#&gt; [5,] 2.683056 2.627766
#&gt; [6,] 2.694056 2.665444
#&gt; [7,] 2.519730 2.522684
#&gt; [8,] 2.648985 2.644502
#&gt; [9,] 2.795908 2.774028
#&gt; [10,] 2.964416 2.923566

AR(1) coeff -0.5

AR(1) coeff 0.6

```txt
set.seed(12345)
ar2pos = arima.sim(n=300, list(ar=c(0.6, 0.2)), sd=0.5)
plot(ar2pos, main="AR(2) coeff 0.6 0.2")
vgram_ar2 = variogram(ar2pos, lagmax=15, iprint=T)
#&gt; G H
#&gt; [1,] 1.000000 1.000000
#&gt; [2,] 1.387805 1.405190
#&gt; [3,] 1.724972 1.749292
#&gt; [4,] 1.995873 2.036656
#&gt; [5,] 2.165293 2.205862
#&gt; [6,] 2.517811 2.556461
#&gt; [7,] 2.589636 2.627422
#&gt; [8,] 2.778060 2.805578
#&gt; [9,] 2.780449 2.805620
#&gt; [10,] 2.818968 2.835946
#&gt; [11,] 2.942737 2.947873
#&gt; [12,] 2.998995 2.994785
#&gt; [13,] 3.141642 3.125420
#&gt; [14,] 3.188422 3.170977
#&gt; [15,] 3.197623 3.181744
data(sunspot.year) # ts object, starts Jan 1700 yearly (averaged) to 1988
plot(sunspot.year)

```txt
Gvec = variogram(sunspot.year,lagmax=20, iprint=T)
#&gt; G H
#&gt; [1,] 1.000000 1.000000
#&gt; [2,] 3.031432 2.976028
#&gt; [3,] 5.278880 5.149869
#&gt; [4,] 6.990832 6.788944
#&gt; [5,] 7.832168 7.573062
#&gt; [6,] 7.595477 7.322874
#&gt; [7,] 6.442292 6.229226
#&gt; [8,] 4.711738 4.622474
#&gt; [9,] 2.966479 3.035543
#&gt; [10,] 1.909677 2.111771
#&gt; [11,] 1.910441 2.132646
#&gt; [12,] 2.868127 3.039530
#&gt; [13,] 4.396565 4.476397
#&gt; [14,] 5.907502 5.884356
#&gt; [15,] 7.008279 6.893103
#&gt; [16,] 7.409141 7.242713
#&gt; [17,] 7.152719 6.985469
#&gt; [18,] 6.299030 6.183599
#&gt; [19,] 5.105432 5.095565
#&gt; [20,] 3.956960 4.058060
```

AR(2) coeff 0.6 0.2

# More plots for sunspot numbers monthly and yearly
```txt
Gvec = variogram(sunspot.year,lagmax=20, iprint=T)
#&gt; G H
#&gt; [1,] 1.000000 1.000000
#&gt; [2,] 3.031432 2.976028
#&gt; [3,] 5.278880 5.149869
#&gt; [4,] 6.990832 6.788944
#&gt; [5,] 7.832168 7.573062
#&gt; [6,] 7.595477 7.322874
#&gt; [7,] 6.442292 6.229226
#&gt; [8,] 4.711738 4.622474
#&gt; [9,] 2.966479 3.035543
#&gt; [10,] 1.909677 2.111771
#&gt; [11,] 1.910441 2.132646
#&gt; [12,] 2.868127 3.039530
#&gt; [13,] 4.396565 4.476397
#&gt; [14,] 5.907502 5.884356
#&gt; [15,] 7.008279 6.893103
#&gt; [16,] 7.409141 7.242713
#&gt; [17,] 7.152719 6.985469
#&gt; [18,] 6.299030 6.183599
#&gt; [19,] 5.105432 5.095565
#&gt; [20,] 3.956960 4.058060
```

AR(2) coeff 0.6 0.2

# More plots for sunspot numbers monthly and yearly

```python
par(mfrow=c(2,2))
acf(sunspot.year)
spec.pgram(sunspot.year, span=c(5,7))
abline(v=1/10)
acf(sunspot1000mon)
spec.pgram(sunspot1000mon, span=c(5,7))
abline(v=1/120)
```

Series sunspot.year

Series: sunspot.year Smoothed Periodogram

Series sunspot1000mon

Series: sunspot1000mon Smoothed Periodogram

# Appendix

```python
Compare monthly and annual series
# Verify that annual series comes from averages of 12 months of a year
# Check number of years of separation between local maxima of yearly average sunspots counts
data(sunspots)
mon = window(sunspots, start=c(1749,1), end=c(1759,12))
data(sunspot.year) # starts Jan 1700 yearly (averaged)
yr = window(sunspot.year, start=1749, end=1759)

print(yr)
#> Time Series:
#> Start = 1749
#> End = 1759
#> Frequency = 1
#> [1] 80.9 83.4 47.7 47.8 30.7 12.2 9.6 10.2 32.4 47.6 54.0

mon_mat = matrix(mon,nrow=12)
print(mon_mat)
#> [,1] [,2] [,3] [,4] [,5] [,6] [,7] [,8] [,9] [,10] [,11]
#> [1,] 58.0 73.3 70.0 35.0 44.0 0.0 10.2 12.5 14.1 37.6 48.3
#> [2,] 62.6 75.9 43.5 50.0 32.0 3.0 11.2 7.1 21.2 52.0 44.0
#> [3,] 70.0 89.2 45.3 71.0 45.7 1.7 6.8 5.4 26.2 49.0 46.8
#> [4,] 55.7 88.3 56.4 59.3 38.0 13.7 6.5 9.4 30.0 72.3 47.0
#> [5,] 85.0 90.0 60.7 59.7 36.0 20.7 0.0 12.5 38.1 46.4 49.0
#> [6,] 83.5 100.0 50.7 39.6 31.7 26.7 0.0 12.9 12.8 45.0 50.0
#> [7,] 94.8 85.4 66.3 78.4 22.2 18.8 8.6 3.6 25.0 44.0 51.0
#> [8,] 66.3 103.0 59.8 29.3 39.0 12.3 3.2 6.4 51.3 38.7 71.3
#> [9,] 75.9 91.2 23.5 27.1 28.0 8.2 17.8 11.8 39.7 62.5 77.2
#> [10,] 75.5 65.7 23.2 46.6 25.0 24.1 23.7 14.3 32.5 37.7 59.7
#> [11,] 158.6 63.3 28.5 37.6 20.0 13.2 6.8 17.0 64.7 43.0 46.3
#> [12,] 85.2 75.4 44.0 40.0 6.7 4.2 20.0 9.4 33.5 43.0 57.0

yr_mean = apply(mon_mat,2,mean)
print(yr_mean)
#> [1] 80.925000 83.391667 47.658333 47.800000 30.691667 12.216667 9.566667
#> [8] 10.191667 32.425000 47.600000 53.966667

yr2 = window(sunspot.year,start=1749,end=1840)
print(yr2)
#> Time Series:
#> Start = 1749
#> End = 1840
#> Frequency = 1
#> [1] 80.9 83.4 47.7 47.8 30.7 12.2 9.6 10.2 32.4 47.6 54.0 62.9
#> [13] 85.9 61.2 45.1 36.4 20.9 11.4 37.8 69.8 106.1 100.8 81.6 66.5
#> [25] 34.8 30.6 7.0 19.8 92.5 154.4 125.9 84.8 68.1 38.5 22.8 10.2
#> [37] 24.1 82.9 132.0 130.9 118.1 89.9 66.6 60.0 46.9 41.0 21.3 16.0
#> [49] 6.4 4.1 6.8 14.5 34.0 45.0 43.1 47.5 42.2 28.1 10.1 8.1
#> [61] 2.5 0.0 1.4 5.0 12.2 13.9 35.4 45.8 41.1 30.1 23.9 15.6
#> [73] 6.6 4.0 1.8 8.5 16.6 36.3 49.6 64.2 67.0 70.9 47.8 27.5
#> [85] 8.5 13.2 56.9 121.5 138.3 103.2 85.7 64.6

# Number of years of separation between local maxima
localpeaks = c(2,13,21,30,39,56,68,82,89)
separation = diff(localpeaks)
print(separation)
#> [1] 11 8 9 9 17 12 14 7
print(mean(separation))
#> [1] 10.875

# Compare with smoothed spectral periodogram