linear-expsmo page1

Stat 443. Time Series and Forecasting.

Key ideas: additive stochastic models associated with forecasting rules;
forecast is the conditional expectation of future observation given the observed past;
Holt linear exponential smoothing.

Two recursion equations: one for level and one for slope $b$ (called trend in R documentation, but is different from trend in STL).

linear-expsmo page2

The recursions and $h$-step forecasts are as follows.

$$
\hat {\ell} _ {t} = \alpha y _ {t} + (1 - \alpha) (\hat {\ell} _ {t - 1} + \hat {b} _ {t - 1}) = \hat {\ell} _ {t - 1} + \hat {b} _ {t - 1} + \alpha (y _ {t} - \hat {\ell} _ {t - 1} - \hat {b} _ {t - 1})
$$

$$
\hat {b} _ {t} = \beta (\hat {\ell} _ {t} - \hat {\ell} _ {t - 1}) + (1 - \beta) \hat {b} _ {t - 1} = \hat {b} _ {t - 1} + \beta (\hat {\ell} _ {t} - \hat {\ell} _ {t - 1} - \hat {b} _ {t - 1})
$$

$$
\hat {y} _ {t + 1 | t} = \hat {\ell} _ {t} + \hat {b} _ {t}
$$

$$
\hat {y} _ {t + h | t} = \hat {\ell} _ {t} + h \hat {b} _ {t}, \quad h = 1, 2, \dots
$$

The smoothed level $\hat{\ell}_t$ is a convex combination of the most recent observation and the local linear projection of the previous smoothed value.

The smoothed slope $\hat{b}_t$ is a convex combination of the most recent slope change and the previous smoothed slope.

The $h$-step forecast is based on a constant slope using the last smoothed slope value. (Similar to linear extrapolation).

$\alpha, \beta$ are estimated by minimizing the in-sample root mean square prediction error.

linear-expsmo page3

If the HW implementation, such as forecast::holt, outputs the 1-step to 10-step forecasts  $\widehat{y}_{t + h|t}$  at the end of the series, but not  $\widehat{\ell}_t$  and  $\widehat{b}_t$ , then

$$
\begin{array}{l} \widehat {y} _ {t + 1 | t} = \widehat {\ell} _ {t} + \widehat {b} _ {t} \\ \widehat {y} _ {t + 2 | t} = \widehat {\ell} _ {t} + 2 \widehat {b} _ {t} \\ \widehat {b} _ {t} = \widehat {y} _ {t + 2 | t} - \widehat {y} _ {t + 1 | t} \\ \widehat {\ell} _ {t} = \widehat {y} _ {t + 1 | t} - \widehat {b} _ {t} \\ \end{array}
$$

$\widehat{\ell}_t$  and  $\widehat{b}_t$  are needed for the moving 1-step ahead forecasts for getting holdout set forecast errors.

linear-expsmo page4

Pseudo-code for out-of-sample rmse (linear exponential smoothing)

Part 1:

- Input train with size $n$.
- Estimate $\alpha, \beta$ parameters as $\tilde{\alpha}, \tilde{\beta}$. and get the two smoothed series $\tilde{\ell}_3, \ldots, \tilde{\ell}_n$ and $\tilde{b}_3, \ldots, \tilde{b}_n$; $\tilde{\ell}_n$ is the last smoothed level value of the training set. $\tilde{b}_n$ is the last smoothed slope value of the training set.
- Output $\tilde{\alpha}, \tilde{\beta}, \tilde{\ell}_n, \tilde{b}_n$.

Part 2: Separate out-of-sample rmse from linear exponential smoothing because R (HoltWinters and forecast::holt) and SAS might have different values of $\tilde{\alpha}, \tilde{\beta}, \tilde{\ell}_n, \tilde{b}_n$.

- Input $\tilde{\alpha}, \tilde{\beta}, \tilde{\ell}_n, \tilde{b}_n$, holdout with size $n_{holdout}$
- sse← 0
- fc← $\tilde{\ell}_n + \tilde{b}_n$; yt← holdout[1]; newfc← fc; fcvec[1]← fc; fcerror← yt-fc; sse← sse+ fcerror²; $\ell_{prev} \gets \tilde{\ell}_n$; $b_{prev} \gets \tilde{b}_n$.
- for i in 2,..., $n_{holdout}$:
- $\ell_{new} \gets \tilde{\alpha} \times \text{holdout}[i-1] + (1 - \tilde{\alpha}) \times \text{fc}$; $b_{new} \gets \tilde{\beta}(\ell_{new} - \ell_{prev}) + (1 - \tilde{\beta})b_{prev}$; fc← $\ell_{new} + b_{new}$; fcvec[i]← fc; yt← holdout[i]; fcerror← yt-fc; sse← sse+ fcerror²;
- $\ell_{prev} \gets \ell_{new}$; $b_{prev} \gets b_{new}$.
- end for
- return rmse=sqrt(sse/$n_{holdout}$)

4

linear-expsmo page5

On the previous page, why do R HoltWinters, forecast::holt and SAS have (slightly) different values of  $\widehat{\alpha}$ ,  $\widehat{\beta}$ ,  $\widehat{\ell}_n$ ,  $\widehat{b}_n$ .
4

linear-expsmo page5

On the previous page, why do R HoltWinters, forecast::holt and SAS have (slightly) different values of  $\widehat{\alpha}$ ,  $\widehat{\beta}$ ,  $\widehat{\ell}_n$ ,  $\widehat{b}_n$ .

Qualitatively, forecasts are not affected by the implementation of exponential smoothing rules.

linear-expsmo page6

Stochastic model for linear exponential smoothing (upper case $Y, L, B$ and $\epsilon$ for random variables). Write a stochastic model as:

$$
L_t = \alpha Y_t + (1 - \alpha)(L_{t-1} + B_{t-1}) = L_{t-1} + B_{t-1} + \alpha (Y_t - L_{t-1} - B_{t-1})
$$

$$
B_t = \beta (L_t - L_{t-1}) + (1 - \beta) B_{t-1} = B_{t-1} + \beta (L_t - L_{t-1} - B_{t-1})
$$

$$
Y_{t+1} = L_t + B_t + \epsilon_{t+1}, \quad \epsilon_{t+1} \text{ random innovation with mean } 0
$$

Then the idea is to use differencing to eliminate $\{L_t\}$ and $\{B_t\}$, and represent $\{Y_t\}$ in terms of $\{\epsilon_t\}$.

$$
Y_t = L_{t-1} + B_{t-1} + \epsilon_t \text{ or } Y_t - L_{t-1} - B_{t-1} = \epsilon_t
$$

$$
\begin{array}{l}
Y_{t+1} - Y_t = [L_t - L_{t-1}] + [B_t - B_{t-1}] + [\epsilon_{t+1} - \epsilon_t] \\
= [B_{t-1} + \alpha (Y_t - L_{t-1} - B_{t-1})] + \beta (L_t - L_{t-1} - B_{t-1}) + \epsilon_{t+1} - \epsilon_t \\
= [B_{t-1} + \alpha \epsilon_t] + \beta \alpha \epsilon_t + \epsilon_{t+1} - \epsilon_t \\
= B_{t-1} + \epsilon_{t+1} - (1 - \alpha - \alpha \beta) \epsilon_t \\
\end{array}
$$

$$
Y_t - Y_{t-1} = B_{t-2} + \epsilon_t - (1 - \alpha - \alpha \beta) \epsilon_{t-1}
$$

$$
\begin{array}{l}
\Delta_2 Y_{t+1} := (Y_{t+1} - Y_t) - (Y_t - Y_{t-1}) \\
= [B_{t-1} - B_{t-2}] + [\epsilon_{t+1} - (1 - \alpha - \alpha \beta) \epsilon_t] - [\epsilon_t - (1 - \alpha - \alpha \beta) \epsilon_{t-1}] \\
= \beta \alpha \epsilon_{t-1} + \epsilon_{t+1} - (2 - \alpha - \alpha \beta) \epsilon_t + (1 - \alpha - \alpha \beta) \epsilon_{t-1} \\
= \epsilon_{t+1} - (2 - \alpha - \alpha \beta) \epsilon_t + (1 - \alpha) \epsilon_{t-1} \\
\end{array}
$$

Pay attention to the technique. It can be used to convert other exponential smoothing rules into stochastic models.

linear-expsmo page7

Second difference is a linear function of three consecutive $\epsilon$'s. This is an example of an ARIMA model, whose theory leads to forecast standard errors. Initially Holt and Winters proposed simple intuitive forecasting rules, and later others deduced appropriate forecast standard errors.

## Homework (webwork+upload derivation). Damped trend (slope) exponential smoothing

Convert to simple representation similar to preceding.

The damping parameter is denoted as $\phi$; $\phi \in [0,1]$. This allows for sublinear extrapolation for forecasts. Recursion equations are:

$$
\begin{array}{l}
\widehat{\ell}_t = \alpha y_t + (1 - \alpha) (\widehat{\ell}_{t-1} + \phi \widehat{b}_{t-1}) \\
\widehat{b}_t = \beta (\widehat{\ell}_t - \widehat{\ell}_{t-1}) + (1 - \beta) \phi \widehat{b}_{t-1} \\
\widehat{y}_{t+1|t} = \widehat{\ell}_t + \phi \widehat{b}_t \\
\widehat{y}_{t+h|t} = \widehat{\ell}_t + \widehat{b}_t \sum_{i=1}^{h} \phi^i = \widehat{\ell}_t + \widehat{b}_t C_h, \quad h = 1, 2, \dots, \\
C_h = \sum_{i=1}^{h} \phi^i = (1 - \phi^{h+1}) / (1 - \phi) - 1.
\end{array}
$$