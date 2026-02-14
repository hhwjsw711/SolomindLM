Stat 443: Exponential smoothing methods for forecasting

Exponential smoothing methods consist iof a simple class of methods for forecasting. They were developed by Holt and Winters, and they often work well. The Holt and Winter forecasting rules only provide point forecasts. Later, researchers determined stochastic models that lead to these forecasting rules and then forecast intervals with different prediction levels (e.g., 50% or 80% forecast intervals) could be derived.

If calibrated correctly, 50% (80%) forecast intervals should include the future value about 50% (80%) of the time.

For a training/holdout set split, a forecast rule is obtained based on the training set $y_{1},\ldots,y_{n}$. Then for the holdout set $(y_{n+1},\ldots,y_{T})$, with $n+1\leq t\leq T$, the 1-step ahead 50% (80%) forecast interval based on $y_{1},\ldots,y_{t-1}$ should contain the holdout value $y_{t}$ in about 50% (80%) of the cases. If this property does not hold, then the fitted model/method is inadequate?

## 1 Summary of exponential smoothing methods available in R and SAS

SAS has a few more options for exponential smoothing methods with the R function HoltWinters. However the R library forecast has a few additional options for exponential smoothing methods.

Note that different implementations of these forecasting rules lead to slightly different results (estimates of tuning parameters for level, slope, seasonality) because of how the recursion equations are initialized.

A list of the methods are given below.

- simple exponential smoothing (level only)
HoltWinters(tsdata,beta=F,gamma=F) in R
model=simple in PROC ESM in SAS
- linear (Holt) exponential smoothing (level+slope)
HoltWinters(tsdata,gamma=F) in R
model=linear in PROC ESM in SAS
- damped trend exponential smoothing (level+slope)
forecast::holt in a R library forecast
model=damptrend in PROC ESM in SAS

- double (Brown) exponential smoothing (level+slope)
not available in forecast library?
model=double in PROC ESM in SAS
- additive seasonal exponential smoothing (level+seasonality)
HoltWinters(tsdata,beta=F,seasonal=”additive”) in R
model=addseasonal in PROC ESM in SAS
- multiplicative seasonal exponential smoothing (level * seasonality) (positive only)
HoltWinters(tsdata,beta=F,seasonal=”multiplicative”) in R
model=multseasonal in PROC ESM in SAS
- Winters additive model ( level+slope+seasonality )
HoltWinters(tsdata,seasonal=”additive”) in R
model=addwinters in PROC ESM in SAS
- Winters multiplicative model ( [level+slope] * seasonality )
HoltWinters(tsdata,seasonal=”multiplicative”) in R
model=winters in PROC ESM in SAS

## 2 Recursions

Observed time series data $y_{1},\ldots,y_{t},\ldots,y_{T}$.

$\widehat{y}_{t+1|t}$ is the 1-step forecast for time $t+1$ using data to time $t$.

$\widehat{y}_{t+h|t}$ is the $h$-step forecast for time $t+h$ using data to time $t$.

### 2.1 (simple) exponential smoothing

The smoothed sequence $\widehat{\ell}_{t}$ comes from the recursion:

$\widehat{\ell}_{t}$ $=$ $\alpha y_{t}+(1-\alpha)\widehat{\ell}_{t-1},\quad t\geq 2,$
$\widehat{y}_{t+h|t}$ $=$ $\widehat{\ell}_{t},\quad h=1,2,\ldots$

a convex combination of the most recent observation and the previous smoothed level value. By applying recursion, $\widehat{\ell}_{t}$ is a geometric weighted sum of previous observations. The forecast is the most recent smoothed level value.

The parameter $\alpha\in(0,1)$ comes from minimizing the in-sample root mean square prediction error, or equivalently minimizing $\sum_{i=2}^{T}(y_{i}-\widehat{y}_{i|i-1})^{2}=\sum_{i=2}^{T}(y_{i}-\widehat{\ell}_{i-1})^{2}$.

3

## 2.2 Linear trend (Holt)

The recursion has:

$$
\widehat {\ell} _ {t} = \alpha y _ {t} + (1 - \alpha) (\widehat {\ell} _ {t - 1} + \widehat {b} _ {t - 1}) = \widehat {\ell} _ {t - 1} + \widehat {b} _ {t - 1} + \alpha (y _ {t} - \widehat {\ell} _ {t - 1} - \widehat {b} _ {t - 1})
$$
a convex combination of the most recent observation and the previous smoothed level value. By applying recursion, $\widehat{\ell}_{t}$ is a geometric weighted sum of previous observations. The forecast is the most recent smoothed level value.

The parameter $\alpha\in(0,1)$ comes from minimizing the in-sample root mean square prediction error, or equivalently minimizing $\sum_{i=2}^{T}(y_{i}-\widehat{y}_{i|i-1})^{2}=\sum_{i=2}^{T}(y_{i}-\widehat{\ell}_{i-1})^{2}$.

3

## 2.2 Linear trend (Holt)

The recursion has:

$$
\widehat {\ell} _ {t} = \alpha y _ {t} + (1 - \alpha) (\widehat {\ell} _ {t - 1} + \widehat {b} _ {t - 1}) = \widehat {\ell} _ {t - 1} + \widehat {b} _ {t - 1} + \alpha (y _ {t} - \widehat {\ell} _ {t - 1} - \widehat {b} _ {t - 1})
$$

$$
\widehat {b} _ {t} = \beta (\widehat {\ell} _ {t} - \widehat {\ell} _ {t - 1}) + (1 - \beta) \widehat {b} _ {t - 1} = \widehat {b} _ {t - 1} + \beta (\widehat {\ell} _ {t} - \widehat {\ell} _ {t - 1} - \widehat {b} _ {t - 1})
$$

$$
\widehat {y} _ {t + 1 | t} = \widehat {\ell} _ {t} + \widehat {b} _ {t}
$$

$$
\widehat {y} _ {t + h | t} = \widehat {\ell} _ {t} + h \widehat {b} _ {t}, \quad h = 1, 2, \dots
$$

The smoothed level  $\widehat{\ell}_t$  is a convex combination of the most recent observation and the local linear projection of the previous smoothed value. The smoothed slope  $\widehat{b}_t$  is a convex combination of the most recent level change and the previous smoothed slope.

$\alpha, \beta$ are estimated by minimizing the in-sample root mean square prediction error,

## 2.3 Damped-trend linear exponential smoothing

The damping parameter is denoted as  $\phi$ ;  $\phi \in [0,1]$ . The recursion equations are:

$$
\widehat {\ell} _ {t} = \alpha y _ {t} + (1 - \alpha) (\widehat {\ell} _ {t - 1} + \phi \widehat {b} _ {t - 1})
$$

$$
\widehat {b} _ {t} = \beta (\widehat {\ell} _ {t} - \widehat {\ell} _ {t - 1}) + (1 - \beta) \phi \widehat {b} _ {t - 1}
$$

$$
\widehat {y} _ {t + 1 | t} = \widehat {\ell} _ {t} + \phi \widehat {b} _ {t}
$$

$$
\widehat {y} _ {t + h | t} = \widehat {\ell} _ {t} + \widehat {b} _ {t} \sum_ {i = 1} ^ {h} \phi^ {i} = \widehat {\ell} _ {t} + \widehat {b} _ {t} C _ {h}, \quad h = 1, 2, \dots ,
$$

$$
C _ {h} = \sum_ {i = 1} ^ {h} \phi^ {i} = (1 - \phi^ {h + 1}) / (1 - \phi) - 1.
$$

Add your interpretation.

This approach makes sense when the trend is monotone but not necessarily at the same rate (slope is shrunk towards 0).

$\alpha, \beta, \phi$ are estimated by minimizing the in-sample root mean square prediction error,

## 2.4 Double (Brown) exponential smoothing

The smoothing equations are:

$$
\widehat {\ell} _ {t} = \alpha y _ {t} + (1 - \alpha) \widehat {\ell} _ {t - 1}
$$

$$
\widehat {b} _ {t} = \beta (\widehat {\ell} _ {t} - \widehat {\ell} _ {t - 1}) + (1 - \beta) \widehat {b} _ {t - 1}
$$

$$
\widehat {y} _ {t + 1 | t} = \widehat {\ell} _ {t} + \widehat {b} _ {t} / \alpha
$$

$$
\widehat {y} _ {t + h | t} = \widehat {\ell} _ {t} + [ (h - 1) + 1 / \alpha ] \widehat {b} _ {t}
$$

For $\beta=\alpha$, this method may be equivalently described in terms of two successive applications of simple exponential smoothing::

$\widehat{\ell}_{t}^{(1)}$ $=$ $\alpha y_{t}+(1-\alpha)\widehat{\ell}_{t-1}^{(1)},$
$\widehat{\ell}_{t}^{(2)}$ $=$ $\alpha\widehat{\ell}_{t}^{(1)}+(1-\alpha)\widehat{\ell}_{t-1}^{(2)}.$

$\alpha,\beta$ are estimated by minimizing the in-sample root mean square prediction error,

### 2.5 Additive seasonal exponential smoothing

Let $d$ be the period length. One way to initialize is: $\widehat{\ell}_{t}=\overline{y}_{d}$, and $\widehat{s}_{t}=y_{t}-\overline{y}_{d}$ for $t=1,\ldots,d$, where $\overline{y}_{d}=d^{-1}\sum_{i=1}^{d}y_{i}$. Then for $t>d$,
For $\beta=\alpha$, this method may be equivalently described in terms of two successive applications of simple exponential smoothing::

$\widehat{\ell}_{t}^{(1)}$ $=$ $\alpha y_{t}+(1-\alpha)\widehat{\ell}_{t-1}^{(1)},$
$\widehat{\ell}_{t}^{(2)}$ $=$ $\alpha\widehat{\ell}_{t}^{(1)}+(1-\alpha)\widehat{\ell}_{t-1}^{(2)}.$

$\alpha,\beta$ are estimated by minimizing the in-sample root mean square prediction error,

### 2.5 Additive seasonal exponential smoothing

Let $d$ be the period length. One way to initialize is: $\widehat{\ell}_{t}=\overline{y}_{d}$, and $\widehat{s}_{t}=y_{t}-\overline{y}_{d}$ for $t=1,\ldots,d$, where $\overline{y}_{d}=d^{-1}\sum_{i=1}^{d}y_{i}$. Then for $t>d$,

$\widehat{\ell}_{t}$ $=$ $\alpha(y_{t}-\widehat{s}_{t-d})+(1-\alpha)\widehat{\ell}_{t-1}$
$\widehat{s}_{t}$ $=$ $\gamma(y_{t}-\widehat{\ell}_{t})+(1-\gamma)\widehat{s}_{t-d}$
$\widehat{y}_{t+h|t}$ $=$ $\widehat{\ell}_{t}+\widehat{s}_{t+h-d},\quad h=1,\ldots,d$
$\widehat{y}_{t+h|t}$ $=$ $\widehat{y}_{t+h-d|t},\quad h>d$

$\alpha,\gamma$ are estimated by minimizing the in-sample root mean square prediction error,

### 2.6 Winters additive seasonal effect

Let $d$ be the period length. One way to initialize is: $\widehat{\ell}_{t}=\overline{y}_{d}$, $\widehat{b}_{t}=0$ and $\widehat{s}_{t}=y_{t}-\overline{y}_{d}$ for $t=1,\ldots,d$, Then for $t>d$,

$\widehat{\ell}_{t}$ $=$ $\alpha(y_{t}-\widehat{s}_{t-d})+(1-\alpha)(\widehat{\ell}_{t-1}+\widehat{b}_{t-1})$
$\widehat{b}_{t}$ $=$ $\beta(\widehat{\ell}_{t}-\widehat{\ell}_{t-1})+(1-\beta)\widehat{b}_{t-1}$
$\widehat{s}_{t}$ $=$ $\gamma(y_{t}-\widehat{\ell}_{t})+(1-\gamma)\widehat{s}_{t-d}$
$\widehat{y}_{t+1|t}$ $=$ $\widehat{s}_{t+1-d}+(\widehat{\ell}_{t}+\widehat{b}_{t}),$
$\widehat{y}_{t+2|t}$ $=$ $\widehat{s}_{t+2-d}+(\widehat{\ell}_{t}+2\widehat{b}_{t}),$
$\widehat{y}_{t+h|t}$ $=$ $\widehat{s}_{t+h-d}+(\widehat{\ell}_{t}+h\widehat{b}_{t}),\quad h=1,\ldots,d$
$\widehat{y}_{t+d+1|t}$ $=$ $\widehat{s}_{t+1-d}+(\widehat{\ell}_{t}+(d+1)\widehat{b}_{t}),\text{ etc.}$

The deseasonalized smoothed level $\widehat{\ell}_{t}$ is a convex combination of the most recent deseasonalized observation and the local linear projection. The smoothed slope $\widehat{b}_{t}$ is a convex combination of the most recent level change and the previous smoothed slope. The smoothed

seasonal effect $\widehat{s}_t$ is a convex combination of the most recent seasonal estimate and the previous seasonal effect.

$\alpha, \beta, \gamma$ are estimated by minimizing the in-sample root mean square prediction error,

## 2.7 Winters multiplicative seasonal

Note: The time series data must be strictly positive for this method.

Let $d$ be the period length. One way to initialize is: $\widehat{\ell}_t = \overline{y}_d$, $\widehat{b}_t = 0$ and $\widehat{s}_t = y_t / \overline{y}_d$ for $t = 1, \ldots, d$. Then for $t &gt; d$,

$$
\begin{array}{l}
\widehat{\ell}_t = \alpha (y_t / \widehat{s}_{t-d}) + (1 - \alpha) (\widehat{\ell}_{t-1} + \widehat{b}_{t-1}) \\
\widehat{b}_t = \beta (\widehat{\ell}_t - \widehat{\ell}_{t-1}) + (1 - \beta) \widehat{b}_{t-1} \\
\widehat{s}_t = \gamma (y_t / \widehat{\ell}_t) + (1 - \gamma) \widehat{s}_{t-d} \\
\widehat{y}_{t+h|t} = (\widehat{\ell}_t + h \widehat{b}_t) \widehat{s}_{t+h-d}, \quad h = 1, \ldots, d \\
\end{array}
$$

$\alpha, \beta, \gamma$ are estimated by minimizing the in-sample root mean square prediction error,