fc-reg page1

Stat 443. Time Series and Forecasting.

Main ideas:

- Time series forecasting with explanatory variables.
- Cross-correlations between two series.

Example: Canadian monthly GDP (gross domestic product) and unemployment rate (data set at course web site).

Can forecast of unemployment rate be improved using recent past values of both monthly GDP and unemployment rate?

Can forecast of GDP rate be improved using recent past values of both monthly GDP and unemployment rate?

fc-reg page2

Suppose we have a bivariate time series $(y_{1,t}, y_{2,t})$, $t = 1, \ldots, T$, or $(x_t, y_t)$.

$\mathcal{F}_{t-1}$ is used for information (observed data) up to time $t - 1$.

A model of form

$$
E \left(Y _ {t} \mid \mathcal {F} _ {t - 1}, x _ {t}\right) = \alpha + \phi y _ {t - 1} + \beta x _ {t}
$$

is descriptive, and uses the cross-sectional dependence of $x_{t}$ with $y_{t}$. But it cannot be used for forecasting.

For forecasting, one would have to consider models of form:

$$
E \left(Y _ {t} \mid \mathcal {F} _ {t - 1}\right) = \alpha + \phi y _ {t - 1} + \beta x _ {t | t - 1}
$$

$$
\text{or} \quad E \left(Y _ {t} \mid \mathcal {F} _ {t - 1}\right) = \alpha + \phi y _ {t - 1} + \gamma x _ {t - 1}.
$$

The latter is useful if $x$ at a previous time $t - 1$ influences $y$ at time $t$. The cross-correlation function can be used to assess whether this assumption is reasonable.

See Sections 5.4, 5.6 of textbook H&amp;A.

fc-reg page3

Example. Consulting project in 1990s.

Ozone forecasting (May to September, Lower Fraser Valley and Greater Vancouver). Training set: 6 years (May to September) of data.

Response variables: maximum hourly ozone concentration at six stations in Lower Fraser Valley.

Regression models: weighted least squares.

Explanatory variables in final regression model (several variables associated with ozone level, based on meteorology):

- previous day's maximum ozone concentration (ppb);
- temperature (Celsius);
- indicator of precipitation (rain);
- indicator of positive pressure difference relative to Vancouver airport;
- Julian day (day since beginning of year, for quadratic trend)

Forecasting means that meteorological variables (temperature and two indicators) from the same day are not available but could be forecast one day in advance, so that high ozone warnings for the next day could be given one day in advance.

fc-reg page4

# Time series modeling for GDP and unemployment rate

In general, consider two macro-economic variables: can one variable be considered a leading indicator for the other variable. Does GDP = gross domestic product lead unemployment rate or does unemployment rate lead GDP?

Label that two variables as $(y_{1}, y_{2})$ with observations of a bivariate time series $(y_{1,t}, y_{2,t})$, $t = 1, \ldots, T$.

Convert to the differenced series

$$
(y _ {1, t} ^ {\prime}, y _ {2, t} ^ {\prime}) = (y _ {1, t} - y _ {1, t - 1}, y _ {2, t} - y _ {2, t - 1}), \quad t = 2, \ldots , T,
$$

or (for many positive-valued macroeconomic variables)

$$
(y _ {1, t} ^ {\prime}, y _ {2, t} ^ {\prime}) = (\log (y _ {1, t}) - \log (y _ {1, t - 1}), \log (y _ {2, t}) - \log (y _ {2, t - 1})), t = 2, \ldots , T
$$

The two series are (strongly) correlated if the changes in one series are (strongly) correlated with changes in the other series. For example, increases in GDP are associated with decreases in unemployment rate.

fc-reg page5

Visualizations to understand whether one variable leads the other: plots with lagged variables.

$(z_{t}:t = 1,\ldots ,T)$: $\mathsf{lag}(\mathbf{z},\mathbf{k})$ for $k = 1$ has $(z_{2},\dots ,z_{T},NA)$,
$\mathsf{lag}(\mathbf{z},\mathbf{k})$ for $k = -1$ has $(NA,z_{1},\ldots ,z_{T - 1})$. (Add $k$ to subscript).

Compare correlations of

$\{(y_{1,t}^{\prime},y_{2,t - 1}^{\prime}),t = 3,\ldots ,T\}$ (lag $+1$ for $y_1^\prime$) and
The two series are (strongly) correlated if the changes in one series are (strongly) correlated with changes in the other series. For example, increases in GDP are associated with decreases in unemployment rate.

fc-reg page5

Visualizations to understand whether one variable leads the other: plots with lagged variables.

$(z_{t}:t = 1,\ldots ,T)$: $\mathsf{lag}(\mathbf{z},\mathbf{k})$ for $k = 1$ has $(z_{2},\dots ,z_{T},NA)$,
$\mathsf{lag}(\mathbf{z},\mathbf{k})$ for $k = -1$ has $(NA,z_{1},\ldots ,z_{T - 1})$. (Add $k$ to subscript).

Compare correlations of

$\{(y_{1,t}^{\prime},y_{2,t - 1}^{\prime}),t = 3,\ldots ,T\}$ (lag $+1$ for $y_1^\prime$) and

$\{(y_{1,t - 1}^{\prime},y_{2,t}^{\prime}),t = 3,\ldots ,T\}$ (lag $-1$ for $y_1^\prime$)

fc-reg page6

Cross-correlation: pages 19 and 23; Shumway and Stoffer (2017). Time Series Analysis and Its Applications, 4th ed, Springer.

Variables $x, y$; data $(x_{1}, y_{1}), \ldots, (x_{T}, y_{T})$ realizations of $(X_{1}, Y_{1}), \ldots, (X_{T}, Y_{T})$. $\gamma_{xy}(s, t) = \operatorname{Cov}(X_{s}, Y_{t})$, $\rho_{xy}(s, t) = \gamma_{x,y}(s, t) / [\gamma_{xx}(s, s)\gamma_{yy}(t, t)]^{1/2}$. If stationary, these depend on $s, t$ only through $t - s$.

cross-autocovariance function: redefine $\gamma_{xy}(s + h, s)$ as $\gamma_{xy}(h)$, cross-correlation function:

$$
\rho_{xy}(h) = \frac{\gamma_{xy}(h)}{[\gamma_{x}(0)\gamma_{y}(0)]^{1/2}}.
$$

Note that $\gamma_{xy}(h)$ and $\gamma_{xy}(-h)$ are different for $h \neq 0$.

ccf in R has the sample cross-correlation function.

fc-reg page7

fc-reg page8

Series macro[, "gdp"]

Series macro[, "unempl"]

Series macro[, "diflngdp"]

Series macro[, "diflnunempl"]

fc-reg page9

4th plot is from ccf(diflngdp,diflnunempl); what would ccf(diflnunempl,diflngdp) look like?

fc-reg page10

Interpretation for plots: changes in GDP lead changes in unemployment rate with feedback.

Why?

Numerical values of ccf

|  lag | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  ccf | -0.14 | -0.22 | -0.32 | -0.56 | -0.66 | -0.44 | -0.26 | -0.04 | 0.00  |

fc-reg page11

Partial case study in Rmd file: compare forecasting of unemployment: previous forecast rules and the new rule that involves regressing diflnunempl on previous(diflnunempl) and previous(diflngdp).

Data series from https://fred.stlouisfed.org/categories/32268; subseries of 1961-Q1 to 2025-Q1, starting from 1987-Q1 to 2019-Q4. 20 years (80 quarters) for training set; 13 years (52 quarters) for holdout set.

Let $x =$ monthly GDP, $y =$ monthly unemployment rate

The wrangle csv file has diflngdp = $x_{t}^{\prime} = 100[\log (x_{t}) - \log (x_{t - 1}])$ and $y_{t}^{\prime} = 100[\log (y_{t}) - \log (y_{t - 1}])$ (to avoid leading 0.0..., because of small relative monthly changes).

fc-reg page12

If $y_{t}^{\prime}$ (change in unemployment rate) is regressed on $x_{t-1}^{\prime}$ (previous change in CDP) and $y_{t-1}^{\prime}$ (previous change in unemployment rate), then the prediction equation leads to:

$$
\widehat {y} _ {t} ^ {\prime} = 100 \left[ \log \left(\widehat {y} _ {t}\right) - \log \left(y _ {t - 1}\right) \right]
$$

and

$$
\widehat {y} _ {t} = \exp \left\{\widehat {y} _ {t} ^ {\prime} / 100 + \log \left(y _ {t - 1}\right) \right\} = y _ {t - 1} \exp \left\{\widehat {y} _ {t} ^ {\prime} / 100 \right\}.
$$

Similar for $y_{t}^{\prime}$ regressed only on $x_{t - 1}^{\prime}$.

Comparison of forecast rules; see Rmd file at course web site.

|  rule | Holt | persist | average | AR1 | $x_{t-1}^{\prime}$ | $x_{t-1}^{\prime}, y_{t-1}^{\prime}$  |
| --- | --- | --- | --- | --- | --- | --- |
|  rmse | 0.244 | 0.252 | 1.723 | 0.251 | 0.220 | 0.218  |

The simple persist and average rules provide baselines for comparisons.

fc-reg page13

## Summary:

Time series regression modeling/forecasting involves lagged variables, or forecasts of predictor variables.
and

$$
\widehat {y} _ {t} = \exp \left\{\widehat {y} _ {t} ^ {\prime} / 100 + \log \left(y _ {t - 1}\right) \right\} = y _ {t - 1} \exp \left\{\widehat {y} _ {t} ^ {\prime} / 100 \right\}.
$$

Similar for $y_{t}^{\prime}$ regressed only on $x_{t - 1}^{\prime}$.

Comparison of forecast rules; see Rmd file at course web site.

|  rule | Holt | persist | average | AR1 | $x_{t-1}^{\prime}$ | $x_{t-1}^{\prime}, y_{t-1}^{\prime}$  |
| --- | --- | --- | --- | --- | --- | --- |
|  rmse | 0.244 | 0.252 | 1.723 | 0.251 | 0.220 | 0.218  |

The simple persist and average rules provide baselines for comparisons.

fc-reg page13

## Summary:

Time series regression modeling/forecasting involves lagged variables, or forecasts of predictor variables.

The cross-correlation function can provide indicator of which variable leads another for two stationary series.