ARMA page1

Stat 443. Time Series and Forecasting.

Key ideas: autoregressive (AR), moving average (MA), autoregressive moving average (ARMA), autoregressive integrated moving average (ARIMA), stationary time series, variogram.

$\{\epsilon_t\}$ is a white noise innovation sequence with mean 0, variance $\sigma_{\epsilon}^{2} &gt; 0$, in all stochastic models in this set of slides.

ARMA page2

Autoregressive (AR) of order $p$ or $\operatorname{AR}(p)$: regression on previous $p$.

$$
\operatorname{AR}(1): Y_t - \mu = \phi(Y_{t-1} - \mu) + \epsilon_t.
$$

$$
\operatorname{AR}(2): Y_t - \mu = \phi_1(Y_{t-1} - \mu) + \phi_2(Y_{t-2} - \mu) + \epsilon_t.
$$

$$
\operatorname{AR}(p): Y_t - \mu = \sum_{i=1}^{p} \phi_j(Y_{t-i} - \mu) + \epsilon_t.
$$

Here $\epsilon_t$ is an innovation random variable, independent of the past $(Y_{t-1}, Y_{t-2}, \ldots)$, and $\{\epsilon_t\}$ is iid with mean 0, variance $\sigma_\epsilon^2$.

Moving average (MA) of order $q$ or $\operatorname{MA}(q)$.

For $\operatorname{MA}(q)$, the moving average is actually weighted sum of $q$ (time-shifting) consecutive terms of a white noise sequence.

Let $\{\epsilon_t\}$ be a white noise sequence with mean 0, variance $\sigma_\epsilon^2$.

$$
\operatorname{MA}(1): Y_t = \mu + \epsilon_t + \theta \epsilon_{t-1}, \quad Y_{t-1} = \mu + \epsilon_{t-1} + \theta \epsilon_{t-2}.
$$

$$
\operatorname{MA}(2): Y_t = \mu + \epsilon_t + \theta_1 \epsilon_{t-1} + \theta_2 \epsilon_{t-2}.
$$

$\operatorname{MA}(q)$: $Y_t = \mu + \epsilon_t + \sum_{j=1}^{q} \theta_j \epsilon_{t-j}$ (notation in R). Some books use notation $Y_t = \mu + \epsilon_t - \sum_{j=1}^{q} \theta_j \epsilon_{t-j}$.

Is $\epsilon_t$ independent of $(Y_{t-1}, Y_{t-2}, \ldots)$?

ARMA page3

autoregressive moving-average ARMA $(p, q)$, non-negative integers $p, q$; $\phi_p \neq 0$, $\theta_q \neq 0$.

$$
Y_t = \mu + \phi_1(Y_{t-1} - \mu) + \cdots + \phi_p(Y_{t-p} - \mu) + \epsilon_t + \theta_1 \epsilon_{t-1} + \cdots + \theta_q \epsilon_{t-q}.
$$

$$
Y_t - \mu = \sum_{i=1}^{p} \phi_i(Y_{t-i} - \mu) + \epsilon_t + \sum_{j=1}^{q} \theta_j \epsilon_{t-j}.
$$

Take a null sum $\sum_{i=1}^{0} x_i$ or $\sum_{j=1}^{0} x_j$ as 0.

If $q = 0$, ARMA $(p, q)$ is same as AR $(p)$, $p$ positive integer.

If $p = 0$, ARMA $(p, q)$ is same as MA $(q)$, $q$ positive integer.

If $p = q = 0$, ARMA $(p, q)$, $Y_t = \mu + \epsilon_t$.

ARMA page4

autoregressive integrated moving-average ARIMA(p,d,q), non-negative integers p,q; d ∈ {0,1,2}.

$d = 0$: no differencing
$d = 1$: one differencing operation
$d = 2$: two differencing operations

ARIMA(p,0,q) is ARMA(p,q).
ARIMA(p,1,q) is ARMA(p,q) after first difference
ARIMA(p,2,q) is ARMA(p,q) after second difference

ARMA page5

# Exponential smoothing and ARMA

Simple exponential smoothing: differenced series is special case of MA(1) with restricted range on coefficient of  $\epsilon_{t-1}$

$$
Y _ {t} - Y _ {t - 1} = \epsilon_ {t} - \theta \epsilon_ {t - 1}, \quad 0 &lt;   \theta &lt;   1.
$$

Holt linear exponential smoothing: twice differenced series is MA(2) or ARIMA(0,2,2) with restrictions on coefficients

Damped linear trend with  $\phi \in (0,1)$ : (once) differenced series  $W_{t} = Y_{t} - Y_{t-1}$  is ARMA(1,2) or ARMA(1,1,2)

$$
\left(Y _ {t} - Y _ {t - 1}\right) - \phi \left(Y _ {t - 1} - Y _ {t - 2}\right) = \epsilon_ {t} + \theta_ {1} \epsilon_ {t - 2} + \theta_ {2} \epsilon_ {t - 2}
$$

Winters additive seasonal, periodicity  $c$ : difference at lag  $c$  of differenced series is  $\mathsf{MA}(c + 1)$  with restrictions on coefficients

So exponential smoothing methods provide explanations for use of differencing in time series modelling. Also, differencing is sometimes useful for assessing leading variables in multiple time series.

ARMA page6

Stationary sequence of random variables
Damped linear trend with  $\phi \in (0,1)$ : (once) differenced series  $W_{t} = Y_{t} - Y_{t-1}$  is ARMA(1,2) or ARMA(1,1,2)

$$
\left(Y _ {t} - Y _ {t - 1}\right) - \phi \left(Y _ {t - 1} - Y _ {t - 2}\right) = \epsilon_ {t} + \theta_ {1} \epsilon_ {t - 2} + \theta_ {2} \epsilon_ {t - 2}
$$

Winters additive seasonal, periodicity  $c$ : difference at lag  $c$  of differenced series is  $\mathsf{MA}(c + 1)$  with restrictions on coefficients

So exponential smoothing methods provide explanations for use of differencing in time series modelling. Also, differencing is sometimes useful for assessing leading variables in multiple time series.

ARMA page6

Stationary sequence of random variables

Definition: Strictly stationary. A sequence $Y_{1}, Y_{2}, \ldots$ is strictly stationary (invariance to tome shifts) if random vectors $(Y_{t}, \ldots, Y_{t+j})$ and $(Y_{t+h}, \ldots, Y_{t+j+h})$ have the same joint distribution for $t = 1, 2, \ldots, j = 0, 1, 2, \ldots, h = 1, 2, \ldots$. By marginalization, this implies that for $1 \leq t_{1} &lt; t_{2} &lt; \ldots &lt; t_{m}$ and $m = 2, \ldots$,

$$
\left(Y _ {t _ {1}}, Y _ {t _ {2}}, \dots , Y _ {t _ {m}}\right) \stackrel {d} {=} \left(Y _ {t _ {1} + h}, Y _ {t _ {2} + h}, \dots , Y _ {t _ {m} + h}\right), \quad h = 1, 2, \dots , \tag {1}
$$

where $\stackrel{d}{=}$ is the symbol for equal in distribution.

Remarks. 1. Take $j = 0$ (or $m = 1$ in (1)), to get that $Y_{t}$ and $Y_{t + h}$ have the same distribution for $t = 1,2,\ldots ,h = 1,2,\ldots$. There is a common cumulative distribution function $F_{Y}$ for the $Y_{t}$'s. Then we can write $\mu_{Y} = \operatorname{E}(Y_{t})$ and $\sigma_{Y}^{2} = \operatorname{Var}(Y_{t})$ for all $t$.

2. Take $j = 1$, to get that $(Y_{t}, Y_{t+1})$ and $(Y_{t+h}, Y_{t+h+1})$ have the same distribution for $t = 1, 2, \ldots, h = 1, 2, \ldots$. Then we can write $\gamma_{1} = \operatorname{Cov}(Y_{t}, Y_{t+1}) = \operatorname{Cov}(Y_{t+h}, Y_{t+h+1})$, and $\rho_{1} = \rho(1) = \operatorname{Cor}(Y_{t}, Y_{t+1}) = \operatorname{Cor}(Y_{t+h}, Y_{t+h+1})$ for the lag 1 serial correlation.

ARMA page7

3. In (1), take $m = 2$, $t_1 = t$, $t_2 = t + k$ where $k$ is a positive integer. Then $(Y_t, Y_{t+k}) \stackrel{d}{=} (Y_{t+h}, Y_{t+k+h})$ and we can write $\gamma_k = \operatorname{Cov}(Y_t, Y_{t+k}) = \operatorname{Cov}(Y_{t+h}, Y_{t+h+k})$, and $\rho_k = \rho(k) = \operatorname{Cor}(Y_t, Y_{t+k}) = \operatorname{Cor}(Y_{t+h}, Y_{t+h+k})$ for the lag $k$ serial correlation.

**Definition:** Weakly stationary. A sequence $Y_{1}, Y_{2}, \ldots$ is weakly stationary or second order stationary if $\operatorname{E}(Y_{t})$, $\operatorname{Var}(Y_{t})$ do not depend on $t$, and $\operatorname{Cov}(Y_{t}, Y_{t+k})$ is a function of $k$, independent of $t$.

Autocorrelation is only well-defined for a stationary sequence.

Otherwise $\overline{y}$ is not estimating a "population mean" and averaging the products $(y_{1} - \overline{y})(y_{2} - \overline{y}), (y_{2} - \overline{y})(y_{3} - \overline{y}), \ldots, (y_{n-1} - \overline{y})(y_{n} - \overline{y})$ might not have meaning.

ARMA page8

Data sets: which can be considered as stationary? Use a combination of context of data and time series plot of data to determine if an assumption of stationarity is plausible.

1. Vancouver monthly average temperature. How about deseasonalized series?
2. Economic time series (for example, monthly unemployment rate, monthly CPI)
3. Financial returns: for example, $y_{t} = \log (p_{t} / p_{t - 1})$ is log return for the S&amp;P market index $p_t$.
4. Daily water flow of a river at a measuring station. Yearly maximum of daily water flow at same station.

ARMA page9

# Stochastic models

Assume that $\{\epsilon_t\}$ have a constant positive variance.

AR(2): (weak) stationary or not, or maybe need some condition for stationarity?

MA(1): (weak) stationary or not

MA(2): (weak) stationary or not
1. Vancouver monthly average temperature. How about deseasonalized series?
2. Economic time series (for example, monthly unemployment rate, monthly CPI)
3. Financial returns: for example, $y_{t} = \log (p_{t} / p_{t - 1})$ is log return for the S&amp;P market index $p_t$.
4. Daily water flow of a river at a measuring station. Yearly maximum of daily water flow at same station.

ARMA page9

# Stochastic models

Assume that $\{\epsilon_t\}$ have a constant positive variance.

AR(2): (weak) stationary or not, or maybe need some condition for stationarity?

MA(1): (weak) stationary or not

MA(2): (weak) stationary or not

Is $\{Y_t\}$ stationary if $\{W_t = Y_t - Y_{t-1}\}$ is MA(1), such as $W_t = \epsilon_t + \theta \epsilon_{t-1}$.

ARMA page10

Variogram, pp 68–69 of Bisgaard and Kulahci (2011). Time Series Analysis and Forecasting by Example, Wiley. In this book, the variogram is presented as a method to assess stationarity for a numerical time series.

A variogram doesn’t assume stationarity, but assumes that the distribution of $Y_{t+k} - Y_t$ does not depend on $t$ for any positive integer $k$. Hence it implies that if $\{Y_{t+1} - Y_t\}$ is stationary even if $\{Y_t\}$ is non-stationary.

$\{Y_t\}$ stationary implies $\{Y_{t+1} - Y_t\}$ is stationary implies

$$
(Y_t, Y_{t+k}) \stackrel{d}{=} (Y_1, Y_{1+k}) \Rightarrow Y_{t+k} - Y_t \stackrel{d}{=} Y_{1+k} - Y_1 \quad \forall t
$$

$$
(Y_{t_1}, Y_{t_1+k}, \dots, Y_{t_m}, Y_{t_m+k}) \stackrel{d}{=} (Y_1, Y_{1+k}, \dots, Y_{t_m-t_1+1}, Y_{t_m-t_1+1+k}) \Rightarrow
$$

$$
(Y_{t_1+k} - Y_{t_1}, \dots, Y_{t_m+k} - Y_{t_m}) \stackrel{d}{=} (Y_{1+k} - Y_1, \dots, Y_{t_m-t_1+1+k} - Y_{t_m-t_1+1}) \quad \forall t_1 &lt; \dots &lt; t_m
$$

ARMA page11

Example: Let $Y_{t} = Y_{t - 1} + \epsilon_{t} + \theta \epsilon_{t - 1}$ for all $t$.

1. $\{Y_{t}\}$ is non-stationary:

$$
\begin{array}{l}
Y_{t-1} = Y_{t-2} + \epsilon_{t-1} + \theta \epsilon_{t-2} \\
\operatorname{Cov}(Y_{t-1}, \epsilon_{t-1}) = \operatorname{Cov}(Y_{t-2}, \epsilon_{t-1}) + \operatorname{Cov}(\epsilon_{t-1}, \epsilon_{t-1}) + \theta \operatorname{Cov}(\epsilon_{t-2}, \epsilon_{t-1}) = 0 + \sigma_{\epsilon}^{2} + 0 \\
\operatorname{Var}(Y_{t}) = \operatorname{Var}(Y_{t-1}) + \operatorname{Var}(\epsilon_{t}) + \theta^{2} \operatorname{Var}(\epsilon_{t-1}) + 2\theta \operatorname{Cov}(Y_{t-1}, \epsilon_{t-1}) \\
= \operatorname{Var}(Y_{t-1}) + (1 + \theta^{2} + 2\theta) \sigma_{\epsilon}^{2} = \operatorname{Var}(Y_{t-1}) + (1 + \theta)^{2} \sigma_{\epsilon}^{2} \text{ increasing in } t.
\end{array}
$$

2. $Y_{t+1} - Y_t = \epsilon_{t+1} + \theta \epsilon_t$ has distribution not depending on $t$.

$Y_{t+2} - Y_t = Y_{t+2} - Y_{t+1} + Y_{t+1} - Y_t = \epsilon_{t+2} + (\theta + 1) \epsilon_{t+1} + \theta \epsilon_t$ has distribution that doesn't depend on $t$.

For integer $k \geq 3$, $Y_{t+k} - Y_t = \sum_{i=1}^{k} (\epsilon_{t+k} - \theta \epsilon_{t+k-1}) = \epsilon_{t+k} + \sum_{i=1}^{k-1} (\theta + 1) \epsilon_{t+i} + \theta \epsilon_t$ has distribution that doesn't depend on $t$.

11

ARMA page12

Variogram $G_{k}$, $k \geq 1$

Def: $G_{k} = \operatorname{Var}\left(Y_{t + k} - Y_{t}\right) / \operatorname{Var}\left(Y_{t + 1} - Y_{t}\right)$ (not depending on $t$) for $k = 1,2,\ldots$ so that $G_{1} = 1$.

For a stationary time series,

$$
\begin{array}{l}
\operatorname{Var}\left(Y_{t+k} - Y_{t}\right) = \operatorname{Var}\left(Y_{t+k}\right) + \operatorname{Var}\left(Y_{t}\right) - 2\operatorname{Cov}\left(Y_{t+k}, Y_{t}\right) \\
= 2\operatorname{Var}\left(Y_{t}\right) - 2\operatorname{Var}\left(Y_{t}\right)\operatorname{Cor}\left(Y_{t+k}, Y_{t}\right) \\
= 2\sigma_{Y}^{2} - 2\sigma_{Y}^{2}\rho_{k} = 2\sigma_{Y}^{2}(1 - \rho_{k})
\end{array}
$$

and $G_{k} = (1 - \rho_{k}) / (1 - \rho_{1})$.

If close to white noise, then $G_{k} \approx 1$.
11

ARMA page12

Variogram $G_{k}$, $k \geq 1$

Def: $G_{k} = \operatorname{Var}\left(Y_{t + k} - Y_{t}\right) / \operatorname{Var}\left(Y_{t + 1} - Y_{t}\right)$ (not depending on $t$) for $k = 1,2,\ldots$ so that $G_{1} = 1$.

For a stationary time series,

$$
\begin{array}{l}
\operatorname{Var}\left(Y_{t+k} - Y_{t}\right) = \operatorname{Var}\left(Y_{t+k}\right) + \operatorname{Var}\left(Y_{t}\right) - 2\operatorname{Cov}\left(Y_{t+k}, Y_{t}\right) \\
= 2\operatorname{Var}\left(Y_{t}\right) - 2\operatorname{Var}\left(Y_{t}\right)\operatorname{Cor}\left(Y_{t+k}, Y_{t}\right) \\
= 2\sigma_{Y}^{2} - 2\sigma_{Y}^{2}\rho_{k} = 2\sigma_{Y}^{2}(1 - \rho_{k})
\end{array}
$$

and $G_{k} = (1 - \rho_{k}) / (1 - \rho_{1})$.

If close to white noise, then $G_{k} \approx 1$.

For a stationary ARMA process where $|\rho_k|$ is eventually geometrically decreasing to 0, then $G_{k} \to 1 / (1 - \rho_{1})$ as $k \to \infty$ (asymptote to a constant).

ARMA page13

For a process that is MA(1) after differencing,

$$
\begin{array}{l}
\operatorname{Var} \left(Y _ {t + k} - Y _ {t}\right) = \operatorname{Var} \left(\epsilon_ {t + k}\right) + \sum_ {i = 1} ^ {k - 1} (\theta + 1) ^ {2} \operatorname{Var} \left(\epsilon_ {t + i}\right) + \theta^ {2} \operatorname{Var} \left(\epsilon_ {t}\right) \\
= \sigma_ {\epsilon} ^ {2} [ 1 + (k - 1) (1 + \theta) ^ {2} + \theta^ {2} ], \quad k \geq 2; \\
\end{array}
$$

$$
\operatorname{Var} \left(Y _ {t + 1} - Y _ {t}\right) = \sigma_ {\epsilon} ^ {2} (1 + \theta^ {2}),
$$

$$
G _ {k} = \frac {[ 1 + (k - 1) (1 + \theta) ^ {2} + \theta^ {2} ]}{(1 + \theta^ {2})} = O (k), \quad k \rightarrow \infty
$$

The idea is that  $\{G_k\}$  has a different pattern for a stationary sequence and one that is stationary after differencing.

ARMA page14

Sample version $\hat{G}_k$: for training set of size $n$

Var $(Y_{t + k} - Y_t)$ is estimated by

$$
s _ {d _ {k}} ^ {2} = \sum_ {i = 1} ^ {n - k} (y _ {i + k} - y _ {i} - \bar {d} _ {k}) ^ {2} / (n - k - 1), \quad \bar {d} _ {k} = (n - k) ^ {- 1} \sum_ {i = 1} ^ {n - k} (y _ {i + k} - y _ {i}).
$$

Then

$$
\hat {G} _ {k} = s _ {d _ {k}} ^ {2} / s _ {d _ {1}} ^ {2}.
$$

Compare this sample versions

$$
\widehat {H} _ {k} = (1 - \widehat {\rho} _ {k}) / (1 - \widehat {\rho} _ {1}).
$$

These two should be similar if the data time series is (close to) stationary; see examples generated from variogram-examples. Rmd file.

ARMA page15

Some examples in variogram-examples.pdf (variogram-examples.Rmd).

An R function `variogram` that outputs $G$ and $H$ is included in the Rmd file. The plots use a plotting symbol 1 for $\widehat{G}_k$ and symbol 2 for $\widehat{H}_k$.

The function is applied to: Vancouver monthly total precipitation, returns of corporate stocks, quarterly unemployment rate, monthly CPI, `sunspots` (R data set for monthly counts), `sunspots.year` (R data set for annual averages), some simulated AR(1) time series, one simulated AR(2) time series.

ARMA page16

The plots of $\widehat{G}_k$ and $\widehat{H}_k$ should be approximately the same if the data are a realization of a stationary time series.

If $\widehat{G}_k$ and $\widehat{H}_k$ are similar, then the suggestion is that (a) the time series data are a realization of a stationary time series, or (b) the time series data can be modelled by a stationary time series model.

Distinction to be made later.

If $\widehat{G}_k$ and $\widehat{H}_k$ are quite different, then the suggestion is that the time series data are a realization of a non-stationary time series.

ARMA page17

From stochastic model MA(1) to forecast rule.

Suppose $Z_{t} = Y_{t} - \mu = \epsilon_{t} + \theta \epsilon_{t-1}$ for all $t$, where $-1 &lt; \theta &lt; 1$. How to write $Y_{t+1} = g_{t}(Y_{1}, \ldots, Y_{t}; \theta) + \epsilon_{t}$?

Let $B$ be the backward shift operator defined as $Bx_{t} = x_{t - 1}$ for any variable $x$. As preview of later analysis of ARMA time series,
Distinction to be made later.

If $\widehat{G}_k$ and $\widehat{H}_k$ are quite different, then the suggestion is that the time series data are a realization of a non-stationary time series.

ARMA page17

From stochastic model MA(1) to forecast rule.

Suppose $Z_{t} = Y_{t} - \mu = \epsilon_{t} + \theta \epsilon_{t-1}$ for all $t$, where $-1 &lt; \theta &lt; 1$. How to write $Y_{t+1} = g_{t}(Y_{1}, \ldots, Y_{t}; \theta) + \epsilon_{t}$?

Let $B$ be the backward shift operator defined as $Bx_{t} = x_{t - 1}$ for any variable $x$. As preview of later analysis of ARMA time series,

$$
Z _ {t} = \epsilon_ {t} + \theta B \epsilon_ {t} = (1 + \theta B) \epsilon_ {t} \quad (*)
$$

$$
Z _ {t + 1} = (1 + \theta B) \epsilon_ {t + 1}
$$

$$
(1 + \theta B) ^ {- 1} Z _ {t + 1} = \epsilon_ {t + 1}
$$

$$
(1 - \theta B + \theta^ {2} B ^ {2} - \theta^ {3} B ^ {3} + \dots) Z _ {t + 1} = \epsilon_ {t + 1} \quad (- 1 &lt; \theta &lt; 1)
$$

$$
Z _ {t + 1} - \theta B Z _ {t + 1} + \theta^ {2} B ^ {2} Z _ {t + 1} - \theta^ {3} B ^ {3} Z _ {t + 1} + \dots = \epsilon_ {t + 1}
$$

$$
Z _ {t + 1} = \theta Z _ {t} - \theta^ {2} Z _ {t - 1} + \theta^ {3} Z _ {t - 2} + \dots + \epsilon_ {t + 1}
$$

$$
Y _ {t + 1} = \mu + \theta \left(Y _ {t} - \mu\right) - \theta^ {2} \left(Y _ {t - 1} - \mu\right) + \theta^ {3} \left(Y _ {t - 2} - \mu\right) + \dots + \epsilon_ {t + 1} \quad (* *)
$$

$$
Y _ {t} = \mu + \theta \left(Y _ {t - 1} - \mu\right) - \theta^ {2} \left(Y _ {t - 2} - \mu\right) + \theta^ {3} \left(Y _ {t - 3} - \mu\right) + \dots + \epsilon_ {t}
$$

$$
\theta Y _ {t - 1} = \theta \mu + \theta^ {2} \left(Y _ {t - 2} - \mu\right) - \theta^ {3} \left(Y _ {t - 3} - \mu\right) + \theta^ {4} \left(Y _ {t - 4} - \mu\right) + \dots + \theta \epsilon_ {t - 1}
$$

The coeff. of $Y_{1}$ is negligible as $t$ gets larger, or $Y_{t + 1} = g_t(\ldots ,Y_1,\ldots ,Y_t;\theta)$ with infinite past.

Next, use algebra to directly show that $(^{**})$ implies $(^{*})$ $(^{**})$ is in the form $Y_{t + 1} = g_t(\ldots ,Y_1,\ldots ,Y_t;\theta) + \epsilon_{t + 1}$.

ARMA page18

From stochastic model MA(2) to forecast rule.

Suppose $Z_{t} = Y_{t} - \mu = \epsilon_{t} + \theta_{1}\epsilon_{t - 1} + \theta_{2}\epsilon_{t - 2}$ for all $t$, where roots of $g(b) = (1 + \theta_1b + \theta_2b^2) = 0$ are $\eta_1, \eta_2 \in (-1,1)$.

$$
\begin{array}{l}
Z _ {t} = (1 - \eta_ {1} B) (1 - \eta_ {2} B) \epsilon_ {t} \\
(1 - \eta_ {1} B) ^ {- 1} (1 - \eta_ {2} B) ^ {- 1} Z _ {t} = \epsilon_ {t} \quad (| \eta_ {1} | &lt; 1, | \eta_ {2} | &lt; 1 \text{ for next}) \\
(1 + \eta_ {1} B + \eta_ {1} ^ {2} B ^ {2} + \eta_ {1} ^ {3} B ^ {3} + \dots +) (1 + \eta_ {2} B + \eta_ {2} ^ {2} B ^ {2} + \eta_ {2} ^ {3} B ^ {3} + \dots +) Z _ {t} = \epsilon_ {t} \\
Z _ {t} + \psi_ {1} Z _ {t - 1} + \psi_ {2} Z _ {t - 2} + \psi_ {3} Z _ {t - 3} + \dots = \epsilon_ {t} \\
\psi_ {1} = \eta_ {1} + \eta_ {2} \\
\psi_ {2} = \eta_ {1} ^ {2} + \eta_ {1} \eta_ {2} + \eta_ {2} ^ {2} \\
\psi_ {3} = \eta_ {1} ^ {2} + \eta_ {1} ^ {2} \eta_ {2} + \eta_ {1} \eta_ {2} ^ {2} + \eta_ {2} ^ {3} \\
etc \\
\end{array}
$$

Rearrange so that $Y_{t}$ is alone on left side; then shift subscripts. Get the form $Y_{t + 1} = g_{t}(\ldots ,Y_{1},\ldots ,Y_{t};\theta_{1},\theta_{2}) + \epsilon_{t + 1}$, and

$$
\widehat {y} _ {t + 1 | t} = g _ {t} (\dots , y _ {1}, \dots , y _ {t}, \widehat {\theta} _ {1}, \widehat {\theta} _ {2}).
$$

Theory for estimation of parameters in ARMA forthcoming.

ARMA page19

# Appendix

```r
# Check notation for MA coefficients in R
nn = 500
set.seed(443)
y1ts = arima.sim(n=nn, list(order=c(0,0,1), ma=0.5))
round(c(acf(y1ts, plot=F, lag.max=5)$acf), 3)
# [1] 1.000 0.351 -0.018 -0.034 -0.055 -0.030
# theoretical rho1 is theta/(1+theta^2)
```

```r
y2ts = arima.sim(n=nn, list(order=c(0,0,1), ma=-0.5))
round(c(acf(y2ts, plot=F, lag.max=5)$acf), 3)
# [1] 1.000 -0.397 -0.047 0.069 -0.004 0.015
```
$$
\widehat {y} _ {t + 1 | t} = g _ {t} (\dots , y _ {1}, \dots , y _ {t}, \widehat {\theta} _ {1}, \widehat {\theta} _ {2}).
$$

Theory for estimation of parameters in ARMA forthcoming.

ARMA page19

# Appendix

```r
# Check notation for MA coefficients in R
nn = 500
set.seed(443)
y1ts = arima.sim(n=nn, list(order=c(0,0,1), ma=0.5))
round(c(acf(y1ts, plot=F, lag.max=5)$acf), 3)
# [1] 1.000 0.351 -0.018 -0.034 -0.055 -0.030
# theoretical rho1 is theta/(1+theta^2)
```

```r
y2ts = arima.sim(n=nn, list(order=c(0,0,1), ma=-0.5))
round(c(acf(y2ts, plot=F, lag.max=5)$acf), 3)
# [1] 1.000 -0.397 -0.047 0.069 -0.004 0.015
```

```r
est1 = arima(y1ts, order=c(0,0,1)); print(est1)
#Coefficients:
#     ma1 intercept
#     0.4264 -0.0727
#s.e. 0.0413 0.0642
#sigma^2 estimated as 1.015: log likelihood = -713.24, aic = 1432.48
```

```r
est2 = arima(y2ts, order=c(0,0,1)); print(est2)
#Coefficients:
#     ma1 intercept
#     -0.4981 -0.0283
#s.e. 0.0361 0.0217
#sigma^2 estimated as 0.9303: log likelihood = -691.54, aic = 1389.07
```

19