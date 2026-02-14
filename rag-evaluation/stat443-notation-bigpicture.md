Stat 443: Notation and big picture for forecasting

The notation and some probability-based expresssions in this document might look difficult on first and second pass. Return to review this document periodically over the term after seeing how the notation is used to explain forecasts.

## 1 Notation

Note: the reference book by Hyndman and Athanasopoulos does not have good notation to distinguish random variables in stochastic models and realized values in data sets. The proper notation is needed to show derivations and introduce techniques for mathematical analysis of time series models (a) that are presented in this course and (b) that you might encounter in further reading and future work.

$t$ is the time index, $T$ is the length of time series.

Otherwise mostly commonly:

- Upper case roman letters for random variables,
- lower case roman letters for realized data values,
- lower case Greek letters for parameters,
- exception of Greek letter $\epsilon$ to denote a random variable that represents deviation from the mean (or innovation),
- overhead hat or caret $\hat{}$ for estimated quantity,

Observed data $y_{1},\ldots,y_{t},\ldots,y_{T}$ of a variable $y$ at time points $1,\ldots,T$. The time unit is usually day, week, month, quarter, year. Sometimes there are vectors of exogenous variables or covariates $\mathbf{x}_{1},\ldots,\mathbf{x}_{T}$. For example, $y$=monthly sales at a clothing store, $\mathbf{x}$=(average temperature, unemployment rate, amount of advertising, …)

|  Quantity | Stat443 | H&A  |
| --- | --- | --- |
|  time index | t | t  |
|  length of time series | T | T  |
|  observed value | yt | yt  |
|  random variable | Yt | yt  |
|  1-step forecast for time t+1 using data to time t | yt+1|t | yt+1|t  |
|  h-step forecast for time t+h using data to time t | yt+h|t | yt+h|t  |
|  innovation (rv at time t indep. of past) | εt | εt  |
|  forecast error | et(h), Et(h) | et(h)  |
|  exogenous variable vector | xt | xt  |
|  difference of consecutive lag | yt' or Yt'? | yt'  |
|  level (exponential smoothing) a[t] in R | lt | lt  |
|  slope or trend b[t] in R | bt | bt  |
|  seasonal s[t] in R | st | st  |
|  past data at time t+1 | y1, ..., yt or Ft | y1, ..., yt  |
|  autocorrelation lag k | ρk | ?  |
|  sample autocorrelation lag k | ρk | rk  |
|  partial autocorrelation lag k | αk | ?  |
|  sample partial autocorrelation lag k | αk | ?  |

Quantities inside E, Var, Cov, Cor that are random variables should be represented in upper case.

The lower case letter  $f$ , possibly with subscripts, is often used in statistics and probability for a probability density function or probability mass function. The upper case letter  $F$ , possibly with subscripts, is used for the cumulative distribution function.

Conditional expectations and variances are used a lot in time series forecasting because (a) the forecasts are based on the expected value of the next observation given the observed past, (b) prediction intervals for forecasts make use of the variance of the next observation given the observed past.

Let  $Y_{1}, Y_{2}, \ldots, Y_{n}$  be continuous random variables (for Stat 443  $Y$  is continuous and not discrete; for theory for discrete time series, there are many more probabilistic concepts that are needed). The conditional density of  $Y_{n}$  given  $Y_{1} = y_{1}, \ldots, Y_{n-1} = y_{n-1}$  is denoted as

$$
f _ {Y _ {n} | Y _ {1}, \dots , Y _ {n - 1}} (\cdot | y _ {1}, \dots , y _ {n - 1}),
$$

With  $Y_{1} = y_{1},\ldots ,Y_{n - 1} = y_{n - 1}$  given, this conditional density is a mapping from  $(-\infty ,\infty)$  to  $[0,\infty)$ . From a conditional density, conditional probabilities, expectation and variance

can be defined.
Let  $Y_{1}, Y_{2}, \ldots, Y_{n}$  be continuous random variables (for Stat 443  $Y$  is continuous and not discrete; for theory for discrete time series, there are many more probabilistic concepts that are needed). The conditional density of  $Y_{n}$  given  $Y_{1} = y_{1}, \ldots, Y_{n-1} = y_{n-1}$  is denoted as

$$
f _ {Y _ {n} | Y _ {1}, \dots , Y _ {n - 1}} (\cdot | y _ {1}, \dots , y _ {n - 1}),
$$

With  $Y_{1} = y_{1},\ldots ,Y_{n - 1} = y_{n - 1}$  given, this conditional density is a mapping from  $(-\infty ,\infty)$  to  $[0,\infty)$ . From a conditional density, conditional probabilities, expectation and variance

can be defined.

$\Pr(a<Y_{n}\leq b|Y_{1}=y_{1},\ldots,Y_{n-1}=y_{n-1})\int_{a}^{b}f_{Y_{n}|Y_{1},\ldots,Y_{n-1}}(z|y_{1},\ldots,y_{n-1})\,\mathrm{d}z$
$\mathrm{E}\left(Y_{n}|Y_{1}=y_{1},\ldots,Y_{n-1}=y_{n-1}\right)=\mu_{Y_{n}}(y_{1},\ldots,y_{n-1})=\int_{-\infty}^{\infty}z\,f_{Y_{n}|Y_{1},\ldots,Y_{n-1}}(z|y_{1},\ldots,y_{n-1})\,\mathrm{d}z$
$\mathrm{Var}\left(Y_{n}|Y_{1}=y_{1},\ldots,Y_{n-1}=y_{n-1}\right)=\sigma_{Y_{n}}^{2}(y_{1},\ldots,y_{n-1})$
$\qquad=\int_{-\infty}^{\infty}[z-\mu_{Y_{n}}(y_{1},\ldots,y_{n-1})]^{2}\,f_{Y_{n}|Y_{1},\ldots,Y_{n-1}}(z|y_{1},\ldots,y_{n-1})\,\mathrm{d}z$

Stat 443 mainly introduces the class of linear Gaussian time series for which integration is not necessary when using rules for expectations, variances and covariances of linear combination of random variables.

That is, Gaussian time series models have stochastic representations so that integration might not be needed.

For example, consider the stochastic representation

$[Y_{n}|Y_{1}=y_{1},\ldots,Y_{n-1}=y_{n-1}]\sim g_{n}(y_{1},\ldots,y_{n-1})+\epsilon_{n},$

where $g_{n}$ is a continuous function of past observations. The meaning of this notation in words is: “The conditional distribution of $Y_{n}$ given $Y_{1}=y_{1},\ldots,Y_{n-1}=y_{n-1}$ is stochastically the same as $g_{n}(y_{1},\ldots,y_{n-1})+\epsilon_{n}$ where $\epsilon_{n}$ is a random variable.

In a time series context, $Y_{n}$ is a future observation, $y_{1},\ldots,y_{n-1}$ are realized values of past random variables, and $\epsilon_{n}$ is an innovation random variable (usually with mean 0).

Understanding the proper use of notation with upper and lower case is important for interpretion on conditional quantities. What if only $Y_{i}$’s or only $y_{i}$’s occur after the vertical bar?

- $\mathrm{E}\left(Y_{n}|y_{1},\ldots,y_{n-1}\right)$ can be shorthand for $\mathrm{E}\left(Y_{n}|Y_{1}=y_{1},\ldots,Y_{n-1}=y_{n-1}\right)$ if the context of the conditioning random variables is clear, e.g., the meaning of $\mathrm{E}\left(Y_{n}|0.5,1.3,0.9,\ldots,4.2\right)$ must be clear. For general multivariate densities:

$\mu_{Y_{n}|Y_{1},\ldots,Y_{n-1}}(y_{1},\ldots,y_{n-1})$ $=$ $\mu_{Y_{n}|{\cal F}_{n-1}}(y_{1},\ldots,y_{n-1})$
$:=$ $\mathrm{E}\left(Y_{n}|Y_{1}=y_{1},\ldots,Y_{n-1}=y_{n-1}\right)$
$=$ $\int_{-\infty}^{\infty}zf_{Y_{n}|Y_{1},\ldots,Y_{n-1}}(z|y_{1},\ldots,y_{n-1})\,\mathrm{d}z,$

where $f_{Y_{n}|Y_{1},\ldots,Y_{n-1}}$ is a conditional density. The conditional mean depends on the conditioning values $y_{1},\ldots,y_{n-1}$.

- E $(Y_{n}|Y_{1},\ldots,Y_{n-1})$ is shorthand for $\mu_{Y_{n}|\mathcal{F}_{n-1}}(Y_{1},\ldots,Y_{n-1})$, and it is a random variable that is a function of $Y_{1},\ldots,Y_{n-1}$, from the preceding item.
- E $(y_{n}|y_{1},\ldots,y_{n-1})=y_{n}$ because $y_{n}$ is a constant.

## 2 Big picture for time series modelling and forecasting

The data series $y_{1},\ldots,y_{T}$ is a realization of the random sequence $Y_{1},\ldots,Y_{T}$. A general stochastic model is:

$[Y_{t}|Y_{1}=y_{1},\ldots,Y_{t-1}=y_{t-1}]\mathop{=}^{d}g_{t}(y_{1},\ldots,y_{t-1};\bm{\theta})+\epsilon_{t}.$

$\bm{\theta}$ is a parameter to be estimated based on training set $y_{1},\ldots,y_{n}$, where $T/2<n<T$. Suppose the estimate is $\widehat{\bm{\theta}}$. If E $[\epsilon_{t}]=0$ for all $t$, then
- E $(Y_{n}|Y_{1},\ldots,Y_{n-1})$ is shorthand for $\mu_{Y_{n}|\mathcal{F}_{n-1}}(Y_{1},\ldots,Y_{n-1})$, and it is a random variable that is a function of $Y_{1},\ldots,Y_{n-1}$, from the preceding item.
- E $(y_{n}|y_{1},\ldots,y_{n-1})=y_{n}$ because $y_{n}$ is a constant.

## 2 Big picture for time series modelling and forecasting

The data series $y_{1},\ldots,y_{T}$ is a realization of the random sequence $Y_{1},\ldots,Y_{T}$. A general stochastic model is:

$[Y_{t}|Y_{1}=y_{1},\ldots,Y_{t-1}=y_{t-1}]\mathop{=}^{d}g_{t}(y_{1},\ldots,y_{t-1};\bm{\theta})+\epsilon_{t}.$

$\bm{\theta}$ is a parameter to be estimated based on training set $y_{1},\ldots,y_{n}$, where $T/2<n<T$. Suppose the estimate is $\widehat{\bm{\theta}}$. If E $[\epsilon_{t}]=0$ for all $t$, then

$g_{t}(y_{1},\ldots,y_{t-1};\widehat{\bm{\theta}})$

is the fitted value for $t=2,\ldots,n$, and it is the 1-step forecast value for $t=n+1,\ldots,T$. In practice, for an additive innovation, there are different models/methods for the $g_{t}$ functions (denoted as $g_{t}^{(m)}$ for method $m$).

Exercise to check your understanding from previous courses: What is a 50% prediction or 1-step forecast interval for $Y_{t}$ for $t\in\{n+1,\ldots,T\}$? Assume that the $\epsilon_{t}$ are independent and identically distributed (iid) with mean 0 and variance $\sigma_{\epsilon}^{2}$, and …(?).

Let the 1-step forecast at time $t$ for method $m$ be denoted as $\widehat{y}_{t+1|t}^{(m)}$.

A common criterion for comparison is based on the root mean square prediction error (RMSPE):

$\left\{(T-n)\sum_{t=n+1}^{T}(\widehat{y}_{t+1|t}^{(m)}-y_{t})^{2}\right\}^{1/2}$

A better forecasting method has a smaller RMSPE.

Exercise to check your understanding: What are unstated assumptions in order that this RMSPE is meaningful.

More sophisticated methods to compare forecasts (beyond the scope of this course) are based on 50%, 60%, 70%, 80%, 90% forecast intervals.

Inferential statistics goes beyond *point forecasts* to *interval forecasts*. Compare point estimate and confidence or prediction intervals in regression.