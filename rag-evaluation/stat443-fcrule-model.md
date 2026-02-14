frule-to-model page1

Stat 443. Time Series and Forecasting.

Key ideas:
From forecasting rules to time series models assuming additive innovations,
forecast is the conditional expectation of future observation given the observed past;
prediction interval assuming normally distributed innovations;
exponential smoothing.

Important: interpret equations so that you can easily go back and forth between the verbal explanations and mathematical expressions.

Notation: $h$ is a positive integer.
$\widehat{y}_{t+1|t}$ is the 1-step forecast for $Y_{t+1}$ given observed $y_1, \ldots, y_t$.
$\widehat{y}_{t+h|t}$ is the $h$-step forecast for $Y_{t+h}$ given observed $y_1, \ldots, y_t$.

frule-to-model page2

Consider stochastic models for times series data with additive innovation (or disturbance or noise). Why called innovation? In this case, if the forecast of $Y_{t+1}$ given $y_1, \ldots, y_t$ is a function $\widehat{g}_t(y_1, \ldots, y_t)$, then an additive stochastic model implies that there is an innovation rv $\epsilon_{t+1}$ independent of the past such that

$$
Y_{t+1} = g_t(Y_1, \ldots, Y_t) + \epsilon_{t+1}, \quad \mathsf{E}[Y_{t+1}] = \mathsf{E}[g_t(Y_1, \ldots, Y_t)],
$$

where $\mathsf{E}(\epsilon_{t+1}) = 0$. Then a 1-step forecast is the conditional expectation of future observation given the observed past:

$$
\begin{array}{l}
\mathsf{E}[Y_{t+1} \mid Y_1 = y_1, \ldots, Y_t = y_t] \\
= \mathsf{E}[g_t(Y_1, \ldots, Y_t) + \epsilon_{t+1} \mid Y_1 = y_1, \ldots, Y_t = y_t] \\
= \mathsf{E}[g_t(y_1, \ldots, y_t) + \epsilon_{t+1} \mid Y_1 = y_1, \ldots, Y_t = y_t] \\
= g_t(y_1, \ldots, y_t) + \mathsf{E}[\epsilon_{t+1} \mid Y_1 = y_1, \ldots, Y_t = y_t] \\
= g_t(y_1, \ldots, y_t) + \mathsf{E}[\epsilon_{t+1}] = g_t(y_1, \ldots, y_t) + 0 \\
\end{array}
$$

$$
\widehat{y}_{t+1|t} = \mathsf{E}[Y_{t+1} \mid Y_1 = y_1, \ldots, Y_t = y_t] = \widehat{g}_t(y_1, \ldots, y_t)
$$

$\hat{\mathsf{E}}$ and $\hat{g}$ mean that there may be estimated parameters in $g_t$ (such as intercept and slope for linear in previous observation).

Similarly $\widehat{y}_{t+2|t}$ is based on $\mathsf{E}[Y_{t+2} \mid Y_1 = y_1, \ldots, Y_t = y_t]$.

frule-to-model page3

Cases of average in training set, persistence, and linear in most recent observation

In general, there is a parameter $\theta$ for $g_{t}$, so write forecast rule as $g_{t}(Y_{1},\ldots ,Y_{t},\theta)$, where $\theta$ is estimated from the training set $y_{1},\ldots ,y_{n}$ to get $\widehat{\theta}$, and might be updated as more observations are obtained.

For $t &gt; n$, the 1-step forecast is

$$
\widehat {y} _ {t + 1 | t} = \widehat {g} _ {t} (y _ {1}, \ldots , y _ {t}) = g _ {t} (y _ {1}, \ldots , y _ {t}; \widehat {\theta}).
$$

The stochastic model is taken as

$$
Y _ {t + 1} = g _ {t} \left(Y _ {1}, \dots , Y _ {t}; \theta\right) + \epsilon_ {t + 1}, \tag {*}
$$

where $\epsilon_{t + 1}$ has mean 0 and is independent of the past, and $\{\epsilon_i\}$ is an iid (independent and identically distributed) sequence.

$$
\widehat {y} _ {t + 1 | t} = \widehat {\mathbb {E}} \left[ Y _ {t + 1} | Y _ {1} = y _ {1}, \ldots , Y _ {t} = y _ {t} \right] = g _ {t} (y _ {1}, \ldots , y _ {t}; \widehat {\theta})
$$

frule-to-model page4

Forecast rules (see Section 3.1 of H&amp;A): $g_{t}(Y_{1},\ldots ,Y_{t},\theta)$ with $\theta$ to be estimated from training set.

1. Average of past observations in training set of size $n$, assuming iid (independent and identically distributed):

$$
\hat {y} _ {t + 1 | t} = g _ {t} (y _ {1}, \ldots , y _ {t}; \hat {\mu}) = n ^ {- 1} (y _ {1} + \ldots + y _ {n}) = \hat {\mu}, \quad t &gt; n,
$$

$Y_{t + 1} = g_t(Y_1,\ldots ,Y_t;\mu) + \epsilon_{t + 1} = \mu +\epsilon_{t + 1},\quad t &gt; n,$ stochastic using $(^{*})$

$\theta = \mu$ and $\operatorname{E}[g_t(Y_1, \ldots, Y_n, \theta)] = \mu = \operatorname{E}[Y_i]$, where $\epsilon_{t+1}$ has mean 0 and is independent of the past. That is, the stochastic model is
frule-to-model page4

Forecast rules (see Section 3.1 of H&amp;A): $g_{t}(Y_{1},\ldots ,Y_{t},\theta)$ with $\theta$ to be estimated from training set.

1. Average of past observations in training set of size $n$, assuming iid (independent and identically distributed):

$$
\hat {y} _ {t + 1 | t} = g _ {t} (y _ {1}, \ldots , y _ {t}; \hat {\mu}) = n ^ {- 1} (y _ {1} + \ldots + y _ {n}) = \hat {\mu}, \quad t &gt; n,
$$

$Y_{t + 1} = g_t(Y_1,\ldots ,Y_t;\mu) + \epsilon_{t + 1} = \mu +\epsilon_{t + 1},\quad t &gt; n,$ stochastic using $(^{*})$

$\theta = \mu$ and $\operatorname{E}[g_t(Y_1, \ldots, Y_n, \theta)] = \mu = \operatorname{E}[Y_i]$, where $\epsilon_{t+1}$ has mean 0 and is independent of the past. That is, the stochastic model is

$$
Y _ {i} = \mu + \epsilon_ {i}, \quad i = 1, \ldots ,
$$

for an iid sequence of $\{Y_i\}$ (or iid sequence $\{\epsilon_i\}$ with mean 0). This model is called "white noise".

Exercise: What is the standard error that can be used for prediction intervals?

fcrule-to-model page5

2. Persistence $g_{t}(Y_{1},\ldots ,Y_{t}) = Y_{t}$ (no $\theta$) and, with additive innovation, from equation (*),

$$
\widehat {y} _ {t + 1 | t} = y _ {t}, \quad Y _ {t + 1} = Y _ {t} + \epsilon_ {t + 1}, \quad t \geq 1,
$$

where $\epsilon_{t+1}$ has mean 0 and is independent of $Y_1, \ldots, Y_t$. This model is called a random walk because the next observation is the previous one plus some random variable with mean 0.

Exercise: What is the standard error that can be used for prediction intervals?

frule-to-model page6

3. Autoregressive $g_{t}(Y_{1},\ldots ,Y_{t};\theta)$ where $\theta = (\mu ,\phi_1,\dots,)$.

$Y_{t}$ is the sum of a linear function of $Y_{t - 1},\ldots ,Y_{t - p}$ with "noise", where $p$ is a positive integer. With $p = 1$, and $t\geq 1$, from equation $(^{*})$, $g_{t}(y_{1},\dots ,y_{t};\widehat{\mu},\widehat{\phi}_{1}) = \widehat{\mu} +\widehat{\phi}_{1}(y_{t} - \widehat{\mu})$

$$
\widehat {y} _ {t + 1 \mid t} = \widehat {\mu} + \widehat {\phi} _ {1} \left(y _ {t} - \widehat {\mu}\right), \quad Y _ {t + 1} = \mu + \phi_ {1} \left(Y _ {t} - \mu\right) + \epsilon_ {t + 1}, \tag {1}
$$

where $\epsilon_1, \epsilon_2, \ldots$ are iid with mean 0 and var. $\sigma_{\epsilon}^{2}$, and $\epsilon_{t+1}$ is an innovation rv indep. of $Y_t, Y_{t-1}, \ldots, Y_1$. Note that (1) is a Markov process (Markov chain of order 1) with continuous state space (if $Y$'s are continuous rv's).

$$
\begin{array}{l} \mathsf {E} \left[ Y _ {t + 1} \mid Y _ {1} = y _ {1}, \dots , Y _ {t} = y _ {t} \right] = \mathsf {E} \left[ Y _ {t + 1} \mid Y _ {t} = y _ {t} \right] \\ = \mu + \phi_ {1} (y _ {t} - \mu) + E (\epsilon_ {t + 1}) = \mu + \phi_ {1} (y _ {t} - \mu). \\ \end{array}
$$

The parameters $\mu, \phi_1, \sigma_\epsilon^2$ are estimated based on the training set. There is a constraint on $\phi_1$ in order than it is estimable (later slide).

fcrule-to-model page7

For the estimable case, what is a standard error for  $\widehat{y}_{t+1|t}$  for  $t &gt; n$  and that can be used for prediction intervals?

$$
\begin{array}{l} \operatorname {V a r} \left[ Y _ {t + 1} \mid Y _ {1} = y _ {1}, \dots , Y _ {t} = y _ {t} \right] = \operatorname {V a r} \left[ Y _ {t + 1} \mid Y _ {t} = y _ {t} \right] \\ = ^ {\text {w h y ?}} \operatorname {V a r} \left(\epsilon_ {t + 1}\right) = \sigma_ {\epsilon} ^ {2} \\ \end{array}
$$

Gaussian/normality assumption that is common for further derivations, such as for prediction intervals. If  $\{\epsilon_t\}$  is an sequence of iid  $N(0,\sigma_{\epsilon}^{2})$  rv's, then  $Y_{t + 1} = \mu +\phi_1(Y_t - \mu) + \epsilon_{t + 1}$  implies

$$
[ Y _ {t + 1} | Y _ {t} = y _ {t} ] \sim N (\mu + \phi_ {1} (y _ {t} - \mu), \sigma_ {\epsilon} ^ {2})
$$

With known parameters, the  $90\%$  prediction interval is

$$
\mu + \phi_ {1} (y _ {t} - \mu) \pm z _ {0. 9 5} \sigma_ {\epsilon}
$$
Gaussian/normality assumption that is common for further derivations, such as for prediction intervals. If  $\{\epsilon_t\}$  is an sequence of iid  $N(0,\sigma_{\epsilon}^{2})$  rv's, then  $Y_{t + 1} = \mu +\phi_1(Y_t - \mu) + \epsilon_{t + 1}$  implies

$$
[ Y _ {t + 1} | Y _ {t} = y _ {t} ] \sim N (\mu + \phi_ {1} (y _ {t} - \mu), \sigma_ {\epsilon} ^ {2})
$$

With known parameters, the  $90\%$  prediction interval is

$$
\mu + \phi_ {1} (y _ {t} - \mu) \pm z _ {0. 9 5} \sigma_ {\epsilon}
$$

$100(1 - \alpha)\%$  prediction interval (for  $0 &lt; \alpha \leq 0.5$ ) is

$$
\mu + \phi_ {1} (y _ {t} - \mu) \pm z _ {1 - \alpha / 2} \sigma_ {\epsilon}
$$

frule-to-model page8

|  α | 1 - α | z_{1-α/2}  |
| --- | --- | --- |
|  0.5 | 0.5 | 0.675  |
|  0.4 | 0.6 | 0.842  |
|  0.3 | 0.7 | 1.036  |
|  0.2 | 0.8 | 1.282  |
|  0.1 | 0.9 | 1.645  |
|  0.05 | 0.95 | 1.960  |

Estimated 90% prediction interval is

$$
\widehat {\mu} + \widehat {\phi} _ {1} (y _ {t} - \widehat {\mu}) \pm z _ {0. 9 5} \widehat {\sigma} _ {\epsilon} = (\widehat {F} _ {Y _ {t + 1} | \mathcal {F} _ {t}} (0. 0 5), \widehat {F} _ {Y _ {t + 1} | \mathcal {F} _ {t}} (0. 9 5)
$$

where  $\widehat{\mu},\widehat{\phi}_1,\widehat{\sigma}_{\epsilon}$  are obtained based on the training set and  $\widehat{F}$  is the estimated cdf of  $Y_{t + 1}$  given the past  $\mathcal{F}_t$

AR(1): The cdf of  $Y_{t+1}$  given the past  $\mathcal{F}_t$  from above is based on  $N(\mu + \phi_1(y_t - \mu), \sigma_\epsilon^2)$ . In R notation,  $\text{pnorm}(., \mu + \phi_1(y_t - \mu), \sigma_\epsilon)$ . Similar steps can be applied for more complex models to come.

frule-to-model page9

Special cases: exercise: verify the results below, review probability rules for linear combinations of random variables

(a) $-1 &lt; \phi_{1} = \phi &lt; 1$: This is a condition for the Markov process (1) to have a stationary distribution. Stationarity implies that $F_{Y_i,\dots,Y_{i + h}} = F_{Y_j,\dots,Y_{j + h}}$ for all integers $i &lt; j$ and $h &gt; 0$ (distribution is invariant to shift of time index). This implies that the mean and variance of $Y_{t}$ do not depend on $t$. Taking means and variances of (1), one gets

$$
E \left(Y _ {t + 1}\right) = \mu + \phi E \left(Y _ {t}\right) - \phi \mu , \quad \operatorname {V a r} \left(Y _ {t + 1}\right) = \phi^ {2} \operatorname {V a r} \left(Y _ {t}\right) + \sigma_ {\epsilon} ^ {2}.
$$

For weak stationarity (mean and variance stationarity) then $\mu_{Y} = \mathsf{E}(Y_{t + 1}) = \mathsf{E}(Y_{t})$, $\sigma_{Y}^{2} = \mathrm{Var}(Y_{t + 1}) = \mathrm{Var}(Y_{t})$. Then one must have $\mu_{Y} = \mu +\phi \mu_{Y} - \phi \mu$ or $\mu_{Y} = \mu$, and $\sigma_Y^2 = \phi^2\sigma_Y^2 +\sigma_\epsilon^2$ or $\sigma_{\epsilon}^{2} = (1 - \phi^{2})\sigma_{Y}^{2}$ and $-1 &lt; \phi &lt; 1$; (1) can be written as

$$
Y _ {t + 1} - \mu = \phi (Y _ {t} - \mu) + \epsilon_ {t + 1}
$$

and then recursively (exercise)

$$
Y _ {t + h} - \mu = \phi^ {h} (Y _ {t} - \mu) + \phi^ {h - 1} \epsilon_ {t + 1} + \dots + \phi \epsilon_ {t + h - 1} + \epsilon_ {t + h}, \quad h \geq 2.
$$

Parameters $\mu, \phi, \sigma_{\epsilon}$ are estimated from the training data.

Forecasting: $\widehat{y}_{t+1|t} = \widehat{\mu} + \widehat{\phi}(y_t - \widehat{\mu})$ (regression towards the mean), $\widehat{y}_{t+h|t} = \widehat{\mu} + \widehat{\phi}^h(y_t - \widehat{\mu})$ and $\widehat{y}_{t+1|t} \to \widehat{\mu}$ as $h \to \infty$. For a dependent stationary process, there should be a better rule than the sample mean for short-term forecasts.

For $h = 2$, need $\mathsf{E}\left(Y_{t + 2}|Y_1 = y_1,\ldots ,Y_t = y_t\right) = \mathsf{E}\left(Y_{t + 2}|Y_t = y_t\right)$ for AR(1).

frule-to-model page10
$$
Y _ {t + h} - \mu = \phi^ {h} (Y _ {t} - \mu) + \phi^ {h - 1} \epsilon_ {t + 1} + \dots + \phi \epsilon_ {t + h - 1} + \epsilon_ {t + h}, \quad h \geq 2.
$$

Parameters $\mu, \phi, \sigma_{\epsilon}$ are estimated from the training data.

Forecasting: $\widehat{y}_{t+1|t} = \widehat{\mu} + \widehat{\phi}(y_t - \widehat{\mu})$ (regression towards the mean), $\widehat{y}_{t+h|t} = \widehat{\mu} + \widehat{\phi}^h(y_t - \widehat{\mu})$ and $\widehat{y}_{t+1|t} \to \widehat{\mu}$ as $h \to \infty$. For a dependent stationary process, there should be a better rule than the sample mean for short-term forecasts.

For $h = 2$, need $\mathsf{E}\left(Y_{t + 2}|Y_1 = y_1,\ldots ,Y_t = y_t\right) = \mathsf{E}\left(Y_{t + 2}|Y_t = y_t\right)$ for AR(1).

frule-to-model page10

(b) $\phi = 1$: $Y_{t+1} = Y_t + \epsilon_{t+1}$, this is a random walk. Note that $\operatorname{Var}(Y_{t+1}) = \operatorname{Var}(Y_t) + \sigma_\epsilon^2$, so if the process starts with non-random $y_0$, then $\operatorname{Var}(Y_{t+1}) = (t+1)\sigma_\epsilon^2$ (exercise). That is, the variance is increasing linearly in $t$. Forecasting: $\widehat{y}_{t+h|t} = y_t$ for $h &gt; 0$.

(c) $|\phi| &gt; 1$: The process is "exploding" to $\pm\infty$. Why is this clear from (1)?

frule-to-model page11

Some plots of simulated time series generated from autoregressive processes with Gaussian (normally-distributed) innovations.

frule-to-model page12

# Simple exponential smoothing

Exponential (positive) weighted average of past observations. For a constant $\theta \in (0,1)$, (note that sum of weights is 1)

$$
\widehat {y} _ {t + 1 | t} = (1 - \theta) y _ {t} + (1 - \theta) \theta y _ {t - 1} + (1 - \theta) \theta^ {2} y _ {t - 2} + \dots
$$

Note that with an infinite past, from a geometric sum,

$$
\sum_ {i = 0} ^ {\infty} (1 - \theta) \theta^ {i} = (1 - \theta) \cdot (1 - \theta) ^ {- 1} = 1.
$$

The stochastic model with an additive innovation (noise), from (*) on p 3, is

$$
Y _ {t + 1} = (1 - \theta) Y _ {t} + (1 - \theta) \theta Y _ {t - 1} + (1 - \theta) \theta^ {2} Y _ {t - 2} + \dots + \epsilon_ {t + 1}, \quad t = 1, 2, \ldots
$$

where $\epsilon_{i}$ are iid with mean 0 and variance $\sigma_{\epsilon}^{2}$ and the innovation $\epsilon_{t + 1}$ is independent of $Y_{1},\ldots ,Y_{t}$. Then

$$
Y _ {t} = (1 - \theta) Y _ {t - 1} + (1 - \theta) \theta Y _ {t - 2} + (1 - \theta) \theta^ {2} Y _ {t - 3} + \dots + \epsilon_ {t}
$$

$$
Y _ {t + 1} - \theta Y _ {t} = (1 - \theta) Y _ {t} + 0 Y _ {t - 1} + 0 Y _ {t - 2} + 0 Y _ {t - 3} + \dots + \epsilon_ {t + 1} - \theta \epsilon_ {t}
$$

$$
Y _ {t + 1} = Y _ {t} + \epsilon_ {t + 1} - \theta \epsilon_ {t}
$$

The differenced series leads to a simpler representation; and partially explains why differencing is used in the Box-Jenkins methodology to get stationary series after differencing.

12

frule-to-model page13

Recursion of simple exponential smoothing (usually written as):

$$
\widehat {\ell} _ {t} = \alpha y _ {t} + (1 - \alpha) \widehat {\ell} _ {t - 1}; \quad \widehat {y} _ {t + 1 | t} = \widehat {\ell} _ {t}, \quad t = 1, 2, \ldots
$$

$\widehat{\ell}_t$ is a convex combination of the most recent observation and the previous smoothed value. $\widehat{\ell}_{t - 1}$ is a geometric sum of $y_{t - 1},y_{t - 2},\ldots$. Hence

$$
\begin{array}{l}
\widehat {y} _ {t + 1 | t} = \alpha y _ {t} + (1 - \alpha) \widehat {\ell} _ {t - 1} \\
= \alpha y _ {t} + (1 - \alpha) [ \alpha y _ {t - 1} + (1 - \alpha) \widehat {\ell} _ {t - 2} ] \\
= \alpha y _ {t} + (1 - \alpha) \alpha y _ {t - 1} + (1 - \alpha) ^ {2} [ \alpha y _ {t - 2} + (1 - \alpha) \widehat {\ell} _ {t - 3} ] \\
\approx \alpha y _ {t} + \alpha \sum_ {i = 1} ^ {t - 1} (1 - \alpha) ^ {i} y _ {t - i} \\
\end{array}
$$
$\widehat{\ell}_t$ is a convex combination of the most recent observation and the previous smoothed value. $\widehat{\ell}_{t - 1}$ is a geometric sum of $y_{t - 1},y_{t - 2},\ldots$. Hence

$$
\begin{array}{l}
\widehat {y} _ {t + 1 | t} = \alpha y _ {t} + (1 - \alpha) \widehat {\ell} _ {t - 1} \\
= \alpha y _ {t} + (1 - \alpha) [ \alpha y _ {t - 1} + (1 - \alpha) \widehat {\ell} _ {t - 2} ] \\
= \alpha y _ {t} + (1 - \alpha) \alpha y _ {t - 1} + (1 - \alpha) ^ {2} [ \alpha y _ {t - 2} + (1 - \alpha) \widehat {\ell} _ {t - 3} ] \\
\approx \alpha y _ {t} + \alpha \sum_ {i = 1} ^ {t - 1} (1 - \alpha) ^ {i} y _ {t - i} \\
\end{array}
$$

$$
\begin{array}{l}
\widehat {y} _ {t + 2 | t} = \alpha \widehat {y} _ {t + 1 | t} + (1 - \alpha) \widehat {\ell} _ {t} = \widehat {\ell} _ {t} \quad (\text {because } y _ {t + 1} \text {not known for 2-step forecast}) \\
\widehat {y} _ {t + h | t} = \widehat {\ell} _ {t}, \quad t &gt; 1. \\
\end{array}
$$

The 1-step forecast is a geometric weighted average. Write the stochastic model (without hat on $\ell$) for the recursion as:

$$
Y _ {t + 1} = L _ {t} + \epsilon_ {t + 1}, \quad L _ {t} = \alpha Y _ {t} + (1 - \alpha) L _ {t - 1} = L _ {t - 1} + \alpha (Y _ {t} - L _ {t - 1}) = L _ {t - 1} + \alpha \epsilon_ {t}
$$

Then

$$
\Delta Y _ {t + 1} := Y _ {t + 1} - Y _ {t} = \left(L _ {t} - L _ {t - 1}\right) + \epsilon_ {t + 1} - \epsilon_ {t} = \alpha \epsilon_ {t} + \epsilon_ {t + 1} - \epsilon_ {t} = \epsilon_ {t + 1} - (1 - \alpha) \epsilon_ {t}
$$

The previous $\theta$ matches $1 - \alpha$.

fcrule-to-model page14

Pseudo-code for rmse (simple exponential smoothing)
Lab exercise: code and verify the output of R using parameter estimates from HoltWinters()

Part 1:
- Input train with size $n$.
- Estimate $\alpha$ parameter as $\hat{\alpha}$ and get the smoothed series $\hat{\ell}_2, \ldots, \hat{\ell}_n; \hat{\ell}_n$ is the last smoothed value of the training set.
- Output $\hat{\alpha}, \hat{\ell}_n$.

Part 2: Separate out-of-sample rmse from exponential smoothing
- Input $\hat{\alpha}, \hat{\ell}_n$, holdout with size $n_{holdout}$
- sse$\leftarrow$ 0
- fc$\leftarrow \hat{\ell}_n$; yt$\leftarrow$ holdout[1]; $\ell_{new} \leftarrow \hat{\ell}_n$; fcvec[1]$\leftarrow \hat{\ell}_n$; fcerror$\leftarrow$ yt-fc; sse$\leftarrow$ sse$+$ fcerror$^2$.
- for i in 2,..., $n_{holdout}$:
- $\ell_{new} \leftarrow \hat{\alpha} \times \text{holdout}[i-1] + (1 - \hat{\alpha}) \times \ell_{new}$; fc$\leftarrow \ell_{new}$; fcvec[i]$\leftarrow \ell_{new}$; yt$\leftarrow$ holdout[i]; fcerror$\leftarrow$ yt-fc; sse$\leftarrow$ sse$+$ fcerror$^2$.
- end for
- return rmse=sqrt(sse/$n_{holdout}$) and fcvec (forecast vector)